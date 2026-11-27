# Analytics consent / opt-out options (document only — nothing implemented)

Today `src/lib/analytics.ts` sends every event with a persistent `labinate_anon_id` and has no opt-out. Options, cheapest first:

| # | Option | What changes | Effort |
|---|---|---|---|
| 1 | Respect browser signals | Skip `send()` when `navigator.globalPrivacyControl === true` or `navigator.doNotTrack === "1"` (also `window.doNotTrack`). | ~0.5 h + tests |
| 2 | Session-only anon id | Keep the id in `sessionStorage` (or memory) instead of `localStorage`; no cross-visit tracking, loses retention metrics. | ~0.5 h + tests |
| 3 | Settings toggle (opt-out) | `labinate_analytics_off = "1"` in localStorage, checked in `send()`; a small "Analytics: on/off" switch in each app's settings/footer. | ~2 h per app |
| 4 | Consent banner (opt-in, EU) | No events and no anon id until the user accepts; store the choice; "change choice" link. Needs copy + legal review. | ~0.5–1 day + legal |
| 5 | Cookieless aggregate only | Drop `distinct_id`/session ids, send counts only (or a server-side counter). Least data, least insight. | ~0.5 day |

Notes: 1 and 2 combine well and need no UI. Any option must be covered by tests in `tests/analytics.test.ts` (no network in tests). Whether consent is legally required for EU users is a decision for Umut, not a code question.
