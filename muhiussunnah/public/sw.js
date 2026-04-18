/**
 * Shikkha Platform — service worker (Phase 6 offline sync).
 *
 * Strategies:
 *   • Static assets (_next/static/*, fonts, icons) — cache-first
 *   • Same-origin pages — network-first with cache fallback
 *   • API / Supabase calls — network-only by default
 *   • Attendance & marks mutations (POST to /api/sync/attendance, /api/sync/marks)
 *     — intercepted when offline, queued to IndexedDB, replayed when online
 *
 * IndexedDB schema:
 *   DB: "shikkha-offline"  version: 1
 *   Store: "sync_queue"
 *     { id (auto), url, method, body (JSON string), timestamp, retries }
 */

const CACHE = "shikkha-v2";
const OFFLINE_URL = "/offline";
const SYNC_PATHS = ["/api/sync/attendance", "/api/sync/marks"];
const DB_NAME = "shikkha-offline";
const DB_STORE = "sync_queue";

// ─── IndexedDB helpers ────────────────────────────────────────────────────────

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        const store = db.createObjectStore(DB_STORE, { keyPath: "id", autoIncrement: true });
        store.createIndex("timestamp", "timestamp");
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

async function queueRequest(url, method, body) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).add({ url, method, body, timestamp: Date.now(), retries: 0 });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getQueue() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readonly");
    const req = tx.objectStore(DB_STORE).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function deleteQueueItem(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ─── Install / Activate ───────────────────────────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(["/", "/login", "/manifest.webmanifest", OFFLINE_URL]).catch(() => {}),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

// ─── Fetch ────────────────────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Cache-first for static assets
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(png|jpg|jpeg|svg|webp|woff2?|ttf|eot|ico)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ??
          fetch(req).then((res) => {
            if (res && res.status === 200) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
            }
            return res;
          }),
      ),
    );
    return;
  }

  // Offline queue for sync endpoints (POST only)
  if (req.method === "POST" && SYNC_PATHS.some((p) => url.pathname.startsWith(p))) {
    event.respondWith(
      fetch(req.clone()).catch(async () => {
        try {
          const body = await req.text();
          await queueRequest(url.href, req.method, body);
          if ("sync" in self.registration) {
            await self.registration.sync.register("shikkha-sync");
          }
          return new Response(JSON.stringify({ ok: true, queued: true }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "offline" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          });
        }
      }),
    );
    return;
  }

  // Never cache Supabase or other API calls
  if (
    url.hostname.includes("supabase") ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/data/")
  ) {
    return;
  }

  // Skip non-GET
  if (req.method !== "GET") return;

  // Network-first for pages
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(
        () =>
          caches.match(req).then(
            (cached) => cached ?? caches.match(OFFLINE_URL) ?? new Response("Offline", { status: 503 }),
          ),
      ),
  );
});

// ─── Background Sync ──────────────────────────────────────────────────────────

self.addEventListener("sync", (event) => {
  if (event.tag === "shikkha-sync") {
    event.waitUntil(replayQueue());
  }
});

// Replay when page sends REPLAY_QUEUE message (online event handler)
self.addEventListener("message", (event) => {
  if (event.data?.type === "REPLAY_QUEUE") {
    replayQueue().then(() => {
      if (event.ports && event.ports[0]) event.ports[0].postMessage({ ok: true });
    });
  }
});

async function replayQueue() {
  const queue = await getQueue();
  for (const item of queue) {
    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: { "Content-Type": "application/json" },
        body: item.body,
      });
      if (res.ok) {
        await deleteQueueItem(item.id);
      }
    } catch {
      // Still offline — leave in queue, retry next time
    }
  }
  // Notify all window clients
  const clients = await self.clients.matchAll({ type: "window" });
  for (const client of clients) {
    client.postMessage({ type: "SYNC_COMPLETE", count: queue.length });
  }
}
