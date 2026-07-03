# Labinate App Template

Shared scaffold for every Labinate app. Web-first (static PWA), mobile-cheap
(installable PWA now, Capacitor wrap when a store build is worth it).
Analytics and a monetization hook are baked in — no app ships without them.

## Stack

- **Vite + React + TypeScript** — static build, zero servers, free hosting.
- **GitHub Actions → GitHub Pages** — push to `main` deploys automatically.
- **PWA manifest** — installable on mobile without app-store cost.
- **`src/lib/analytics.ts`** — vendor-neutral `track()`; configure
  `VITE_ANALYTICS_ENDPOINT` to point events at a collector.
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
   `npm install && npm run dev` to iterate; `npm run build` must pass.
5. Push to `main`. The workflow builds and deploys to
   `https://<owner>.github.io/labinate-<app>/`.
   Then follow `RELEASE_CHECKLIST.md`.

## Conventions

- `VITE_APP_ID` identifies the app in analytics. Set it in the workflow env
  or a `.env` file (defaults to `unknown-app` — don't ship that).
- Versioning: bump `package.json` version on each release, tag `v<version>`.
- Mobile/store path: `npx cap add ios|android` when an app earns it —
  the relative `base` in `vite.config.ts` already works in Capacitor webviews.
