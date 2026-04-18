<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Notes for agents working in this repo

## Spec is authoritative

Read the four PDFs in the parent folder before meaningful work:

- `../PROJECT_PLAN.md.pdf` — what to build (schema, phases, reports)
- `../FEATURE_COMPARISON.md.pdf` — why (Bornomala audit + differentiators)
- `../FRONTEND_UX_GUIDE.md.pdf` — how every page looks and speaks
- `../ENV_SETUP_GUIDE.md.pdf` — integrations setup

## Next.js 16 breaking changes (confirmed)

- Middleware file is **`src/proxy.ts`** (not `middleware.ts`). Export `proxy()` not `middleware()`.
- Page `params` / `searchParams` are **async** (Promise) — always `await` them.
- `cookies()` from `next/headers` is **async**.
- `useFormState` → `useActionState`.
- Tailwind v4: no `tailwind.config.js`. Tokens live in `src/app/globals.css` under `@theme inline { ... }`.
- shadcn's `base-nova` Button (installed here) does NOT support `asChild`; use `buttonVariants()` on a `<Link>` instead.

## UX rules that MUST be followed (FRONTEND_UX_GUIDE §17)

- Every page uses `<PageHeader>` with title + value subtitle (not just function).
- Every empty state uses `<EmptyState>` with ≥ 2 CTAs + pro tip (never "No data").
- Every dashboard has a metric row + AI insights strip above the fold.
- All numbers rendered via `<BanglaDigit>` — storage stays ASCII, display Bangla.
- All dates via `<BengaliDate>`; madrasa tenants get Hijri too.
- All strings from `messages/*.json` — never hard-code user-facing text.
- Success toasts include ripple effect (who else notified, time saved).
- Dark mode is default; light mode tokens also defined.

## Permissions (PROJECT_PLAN §3)

- DB layer: RLS on every tenant table. Helpers: `is_super_admin()`, `is_school_member(uuid)`, `user_has_any_role(uuid, role[])`.
- API layer: every mutating server action calls `requirePermission()` from `@/lib/auth/permissions`.
- UI layer: `usePermission()` for conditional render. Never trust this alone — server check is authoritative.

## Supabase workflow

- Migrations live in `supabase/migrations/`. Numbered `0001_*.sql` and applied in order.
- `seed_new_school(target_school uuid)` seeds per-tenant defaults (30 fee heads, 24 expense heads, 8 cash-receive heads, GPA 5.0 scale, madrasa kitab stages).
- Regenerate DB types after schema changes: `npm run db:types` (with `SUPABASE_PROJECT_REF` in env).
- The `Database` type in `src/lib/supabase/types.ts` is a PERMISSIVE placeholder until real types are generated.

## Commit discipline

- Never commit `.env.local`.
- Run `npm run build` before marking any significant work done.
