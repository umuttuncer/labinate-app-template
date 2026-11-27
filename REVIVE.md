# REVIVE.md — umuttuncer/labinate-app-template (night2/M87, 2026-11-27)

## What it is
The public **GitHub template repo** (`isTemplate: true`) for the July 2026 "app factory". It is a Vite 5 + React 18 + TS
static PWA with `src/lib/analytics.ts` (`track()`, PostHog capture format), `src/lib/monetization.ts`
(`requirePro()` paywall stub) and `.github/workflows/deploy.yml` (GitHub Pages).
It has 3 commits, all from 2026-07-04 (`1dde4ca` → `4be8827` → `2125c9c` "Wire analytics to shared PostHog project (LAB-5)").
It is deployed by its own workflow to `https://umuttuncer.github.io/labinate-app-template/` (last Pages deployment `2125c9c`,
2026-07-04). Children: `labinate-demo-tally` (made before LAB-5) and `labinate-flagzoom` (LAB-5 analytics retrofitted).
It is not related to the Nuxt `Labinate/labinate-boilerplate` (see the report).

## Commands run (Node 24.22.1, npm 11.21.1)
| Command | Before | After (`night2/M87`) |
|---|---|---|
| `npm ci` | 0 | 0 |
| `npx tsc --noEmit` | 0 | 0 |
| `npm run build` | 0 (JS 144 kB) | 0 |
| `npm audit` | 7 (5 high, 2 moderate) | 2 (vite high, esbuild moderate) |
| `npm audit --omit=dev` | 0 | 0 |

`npm audit fix` (without `--force`) changed only `package-lock.json` (commit `061d730`). The 2 that remain are
dev-server-only advisories for vite ≤6.4.3 and esbuild ≤0.24.2. Fixing them needs vite 6+ (`--force` → vite 8), which is a major
upgrade. Not done; it is not in the shipped bundle.
**Tested on `night2/M112-opt-vitest-major` (2026-11-27): vitest 5.1.2 + vite 6.4.6** (vite major forced by vitest 5 peer `vite ^6.4`) — `npm audit` 0, 37/37 tests, typecheck/build green; JS bundle hash changes only because vite 6 wraps CommonJS (React) in lazy `require*()` (`strictRequires` default), app code unchanged. vitest 5 needs Node ≥22.12.

## Review: what is unsafe to copy into a new app (doc only; nothing here was zero-risk to change)
1. **Shared PostHog key + endpoint in `.env.production`** (`VITE_ANALYTICS_KEY`, a `phc_…` public project key, also
   in FlagZoom). It is public by design (write-only ingest), so it is not a secret. Side effects:
   - every app created from the template reports into the same project unless `VITE_APP_ID` is changed (the template ships `rename-me`);
   - anyone can post fake events to that project.
   Accept this, or give each app its own key.
2. **`$current_url: location.href`** sends the full URL, including query and `#hash`, with every event. An app that later puts
   tokens, e-mails or share codes in the URL would leak them to PostHog. Safer: `location.origin + location.pathname`.
   **Fixed on `night2/M105`:** `safeUrl()` (origin + pathname) for `$current_url` and `referrer`, with tests; see README "Analytics & privacy".
3. **No consent or opt-out.** A persistent `labinate_anon_id` is kept in localStorage and every event is sent. This may need a
   consent notice for EU users (legal call, not a code bug).
4. **The paywall is not protection.** `isPro()` is `localStorage.labinate_pro === "1"`, and `requirePro()` unlocks for free when `confirm()` returns OK
   (it is labelled a stub). Anyone can set that key in devtools. It also fires `purchase_completed` with
   `provider: "stub"`, which inflates funnel numbers. Never gate real paid content with it. Wire a server-verified
   entitlement (Stripe or RevenueCat webhook) before taking money, and filter `provider=stub` out of the metrics.
5. **Workflow:**
   - `pages: write` and `id-token: write` are granted at workflow level, so the `build` job (which runs `npm ci`
     install scripts) gets them too. They should be job-scoped to `deploy`.
   - Actions are pinned to major tags (`@v4`, `@v3`, `@v5`), not commit SHAs.
   - `configure-pages` `enablement: true` cannot work with `GITHUB_TOKEN` (the README already says to enable Pages manually).
   - Each of these changes CI behaviour that I cannot test locally, so they are only listed here.
6. Fine as is: `base: "./"`, `.gitignore` covers `.env` and `*.local`, and no secret values are in the history (3 commits, 23 blobs scanned).

## Env vars (names)
`VITE_APP_ID`, `VITE_ANALYTICS_ENDPOINT`, `VITE_ANALYTICS_KEY` (all build-time and public).

## Options (no decision made here)
| Option | What is lost |
|---|---|
| **Keep** (public template) | Nothing. Fix items 2, 4 and 5 before anyone uses it for a new app. |
| **Archive** | It can still be used as a template (archived repos can still be "Use this template"). It cannot be fixed without unarchiving. Pages keeps serving the demo counter. |
| **Delete** | The template itself (3 commits; FlagZoom has the same files at `99c4d4f` except App/CSS). The Pages site `/labinate-app-template/` goes away. Nothing else depends on it. |
