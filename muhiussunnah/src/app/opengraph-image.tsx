import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt = "Muhius Sunnah — School & Madrasa Management Platform";

/**
 * Dynamic 1200x630 OpenGraph card. Generated at the edge so the first
 * share on social media doesn't block anyone, and gets baked into the
 * edge cache afterwards.
 */
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          position: "relative",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #0c4a6e 100%)",
          fontFamily: "sans-serif",
          color: "#ffffff",
          overflow: "hidden",
        }}
      >
        {/* Top-left aurora blobs */}
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -160,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,92,255,0.55), transparent 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -180,
            right: -160,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34,211,238,0.45), transparent 60%)",
          }}
        />

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 42,
              fontWeight: 900,
              color: "#fff",
              background: "linear-gradient(135deg, #7c5cff, #22d3ee)",
              boxShadow: "0 12px 40px rgba(124,92,255,0.6)",
            }}
          >
            م
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em" }}>
              Muhius Sunnah
            </div>
            <div style={{ fontSize: 18, opacity: 0.7, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              School &amp; Madrasa Management
            </div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 960 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.035em",
              background: "linear-gradient(135deg, #fff 0%, #c4b5fd 55%, #67e8f9 100%)",
              backgroundClip: "text",
              color: "transparent",
              WebkitBackgroundClip: "text",
            }}
          >
            Complete madrasa &amp; school management — all in one platform.
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 26,
              lineHeight: 1.4,
              opacity: 0.88,
              maxWidth: 880,
            }}
          >
            Admissions, attendance, exams, fees, parent portal, hifz &amp; certificates —
            built for Bangladesh.
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 20,
            opacity: 0.85,
          }}
        >
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ padding: "6px 14px", borderRadius: 999, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)" }}>
              🕌 Bangla + English
            </span>
            <span style={{ padding: "6px 14px", borderRadius: 999, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)" }}>
              🇧🇩 Made for Bangladesh
            </span>
          </div>
          <div style={{ fontWeight: 700, letterSpacing: "0.05em" }}>muhiussunnah.app</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
