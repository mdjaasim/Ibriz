# Ibriz: project context for Claude

Read this first, then `docs/PLAN.md` (full plan, decisions, status, next steps).

## What this is
Ibriz is a mobile-first web app (PWA) that shows live, indicative gold rates for **Tamil Nadu** (one statewide rate on the Chennai benchmark, labelled Chennai / Coimbatore / Madurai / Trichy), with change tracking, charts, a private on-device "My Gold" holdings tracker, and a Learn tab with a guide behind every screen. Owner: Jaasim (jaasim@fuze.us). Used by the owner first, shared with others later. Users are in India, mostly Tamil Nadu.

## Hard constraints
- **Everything free.** No paid services, no card. Free tiers only (Cloudflare Workers/Pages/KV/D1, GitHub). Check free limits before adding anything.
- **No app stores.** Delivered as an installable PWA link; optional Android APK later.
- **Holdings never leave the phone.** My Gold data lives only on the device (IndexedDB). The server may hold only anonymous price thresholds for push alerts. No logins.
- **Rates are indicative, never presented as a shop quote.** Always show source and time. Do not label values "spot", "MCX" or "IBJA" unless they are.
- **No price predictions.** Only descriptive signals computed from our own saved history, labelled educational, not advice. A lawyer should review the signals and disclaimer before public launch (not legal advice from us).
- **Minimal UI.** Home screen shows at most six things; everything else is one tap deeper. Max four bottom tabs: Home, Charts, My Gold, Learn.
- **Every screen and feature has a guide** (micro-guide "?", Learn lesson, or glossary term). The owner reviews each guide before it ships; each shows sources and a "last reviewed" date.

## The owner
Not a gold or engineering expert. Explain in plain language, give exact step-by-step instructions for anything done outside the repo (Terminal, Cloudflare dashboard), and say plainly what is verified versus assumed. Prefers short answers, minimal formatting.

## Repo layout (current)
- `src/rate.js` pure maths (spot to Indian rate, karats, sovereign, change, sanity check)
- `src/sources.js` gold-api.com and USD/INR fetchers (FX cached in KV)
- `src/update.js` one update cycle: fetch, compute, log to D1, publish latest to KV
- `src/index.js` Worker: cron every 5 minutes plus `/api/rate`, `/api/health`, `/api/log.csv`, `/api/run`
- `schema.sql` D1 table `readings`
- `wrangler.toml` settings (DUTY 0.15, PREMIUM 0.03, MAX_JUMP 0.05) and bindings (KV `RATES`, D1 `DB`)
- `test/` run with `npm test` (Node built-in test runner, 13 tests)
- `scripts/calibrate.mjs` compares the log with real quotes noted in `calibration/quotes.csv`

## Conventions
- Keep maths in pure functions in `src/rate.js`; no network or storage there. Test everything pure.
- Settings that can change (duty, GST, premium, making-charge defaults) live in config, never hard-coded in screens or guides; guides read from the same config.
- Never commit secrets. Use `wrangler secret put` (e.g. `LOG_TOKEN`). `.dev.vars` is git-ignored.
- Cloudflare free plan: 10 ms CPU per request, 100,000 requests per day, KV 1,000 writes per day, D1 5 million row reads per day (enforced). Charts must read pre-aggregated hourly and daily rows, never raw 5-minute rows.
- Run `npm test` before every commit. Commit small, with clear messages.

## Current status
Rate-engine prototype written and unit-tested, **not yet deployed or run against live services**. The USD/INR source (Frankfurter) was written from its docs and is untested live. See "Status and next steps" in `docs/PLAN.md`.

## Design
The approved design lives in `../design/` (repo root): `DESIGN.md` is the spec, `screens/` the PNGs, `prototype/` clickable HTML, `tokens.css` the variables. Build exactly that.
