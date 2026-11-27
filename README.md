# Labinate App Template

Shared scaffold for every Labinate app. Web-first (static PWA), mobile-cheap
(installable PWA now, Capacitor wrap when a store build is worth it).
Analytics and a monetization hook are baked in — no app ships without them.

## Stack

- **Vite + React + TypeScript** — static build, zero servers, free hosting.
- **GitHub Actions → GitHub Pages** — push to `main` deploys automatically.
- **PWA manifest** — installable on mobile without app-store cost.
- **`src/lib/analytics.ts`** — vendor-neutral `track()`; ships pre-wired to
  the shared portfolio PostHog project via `.env.production`
  (`VITE_ANALYTICS_ENDPOINT` + `VITE_ANALYTICS_KEY`, both safe to commit).
- **`src/lib/monetization.ts`** — `requirePro()` paywall stub that tracks the
  purchase funnel (paywall_shown → purchase_clicked → purchase_completed).

## New app in 5 steps

1. `gh repo create labinate-<app> --public --template <owner>/labinate-app-template --clone`
2. Enable Pages once (the workflow token can't create the Pages site itself):
   `gh api repos/<owner>/labinate-<app>/pages -X POST -f build_type=workflow`
3. In `package.json`: set `name`. In `index.html` + `public/manifest.webmanifest`:
   set the app title/short_name. Set `VITE_APP_ID` in `.env.production`.
4. Replace `src/App.tsx` with the actual app. Keep the pattern:
   `track()` on meaningful actions, `requirePro()` on the premium path.
   `npm install && npm run dev` to iterate; `npm test`, `npm run typecheck`
   and `npm run build` must pass.
5. Push to `main`. The workflow builds and deploys to
   `https://<owner>.github.io/labinate-<app>/`.
   Then follow `RELEASE_CHECKLIST.md`.

## Conventions

- `VITE_APP_ID` identifies the app in analytics. Set it in `.env.production`
  (the template ships `rename-me` — don't ship that). Events for the whole
  portfolio land in one PostHog project, segmented by the `app` property.
- Versioning: bump `package.json` version on each release, tag `v<version>`.
- Mobile/store path: `npx cap add ios|android` when an app earns it —
  the relative `base` in `vite.config.ts` already works in Capacitor webviews.

## Analytics & privacy

What `src/lib/analytics.ts` sends, exactly:

- **When:** `app_open` once at startup (`initAnalytics()` in `main.tsx`), plus
  every `track(event, props)` call the app makes. Nothing else (no autocapture,
  no cookies, no session recording).
- **Where:** only if `VITE_ANALYTICS_ENDPOINT` is set at build time
  (`.env.production`). Without it nothing leaves the device (dev builds log to
  the console). Transport: `navigator.sendBeacon`, falling back to
  `fetch(..., { keepalive: true })`, body is JSON sent as `text/plain`.
- **Payload (PostHog capture format, when `VITE_ANALYTICS_KEY` is set):**
  `api_key` (public project key), `event`, `timestamp` (ISO),
  `distinct_id` = random UUID kept in localStorage key `labinate_anon_id`
  (stable per browser until storage is cleared), and `properties`:
  `app` (`VITE_APP_ID`), `session_id` (random UUID per page load),
  `$current_url`, plus the event's own props. `app_open` adds
  `referrer` and `standalone` (installed-PWA flag).
  Without a key the raw `{ app, event, props, anonId, sessionId, ts }` is sent.
- **URLs are reduced to origin + pathname** by `safeUrl()`: no query string,
  no `#fragment`, no `user:password@`. Non-http(s) URLs are not sent
  (`$current_url` omitted, referrer becomes `"other"`); an empty referrer is
  `"direct"`. Do not put secrets in the *path* — the path is still sent.
- **Not sent by this code:** IP address and user agent are not in the payload,
  but the analytics server sees them on the HTTP request.
- **No consent / opt-out yet** (the anon id is persistent). That is a product
  and legal decision; see `REVIVE.md`.
- Tests (`npm test`) cover the payload shape, the URL stripping and "no
  network without an endpoint"; `tests/setup.ts` makes any unmocked
  `fetch`/`sendBeacon` throw, so tests never send real events.
