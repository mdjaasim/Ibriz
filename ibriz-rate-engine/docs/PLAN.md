# Ibriz: plan, decisions and handover

Distilled from the planning session of 20 November 2026. The original plan lives in a Claude Docs page (may not be reachable from here), so this file is the in-repo copy. Dates are 2026.

## 1. Status and next steps (start here)

**Done**
- Plan agreed: product scope, UX, architecture, data sources, roadmap (below).
- Validation of sources done on paper (section 5).
- Rate-engine prototype written in `src/`, 13 unit tests passing, smoke-tested with stubs.
- GitHub repo `ibriz` and a free Cloudflare account created by the owner.

**Not done**
- Prototype **not deployed**; never run against live gold-api.com or the FX source.
- USD/INR source untested live. Response shape handling in `parseFxResponse` is a best reading of Frankfurter's docs (v1 `rates.INR`, v2 list with `quote: "INR"`).
- No one-week price log yet; shop premium (`PREMIUM`, currently 0.03) is a starting guess.
- No app UI built and no guides written yet. **Design is done and approved (21 Nov 2026): see `design/DESIGN.md` at the repo root** (38 screens, clickable prototype, tokens).

**Next steps, in order**
1. Deploy the Worker (README steps 2 to 5). Fix whatever the first live run shows, most likely the FX parsing. Check `/api/health` and `/api/rate`.
2. Run the one-week validation: owner notes 2 or 3 real quotes a day (IBJA 999, a Chennai or Trichy jeweller 22K, before GST and making charges) in `calibration/quotes.csv`; after 7 days run `npm run calibrate -- log.csv calibration/quotes.csv` and set `PREMIUM`.
3. Decide on a second USD/INR source if daily steps in the rupee value look jumpy.
4. Add rollups for charts: hourly and daily tables (or views) in D1, a `/api/history?range=` endpoint, and a one-time seed of about 30 days of daily history from goldprice.dev.
5. ~~Design the screens with the owner.~~ Done: `design/DESIGN.md`, `design/screens/`, `design/prototype/`. Build from these; ask before changing the design.
6. Scaffold the PWA on Cloudflare Pages (TypeScript with Svelte or React + Vite; pick one with the owner), installable manifest, service worker, offline cache.
7. Build the MVP (section 8), writing each guide alongside its feature and sending it to the owner for review.

**Gates** (go or stop before the next phase): Gate 1 after validation (source terms confirmed, formula within a tolerance of shop quotes). Gate 2 after MVP (owner uses it daily and trusts the rates; beta group skipped for now). Gate 3 before signals go public (signals back-tested, lawyer reviewed disclaimer).

## 2. Product

- **Name:** Ibriz. **Platform:** PWA, installable from a link. Android Chrome shows "Install app"; iPhone uses Share, then Add to Home Screen. Optional Android APK later via Bubblewrap or PWABuilder (needs an `assetlinks.json`).
- **Region:** Tamil Nadu only for now. Tamil Nadu jewellers largely follow one Chennai-based rate, so one statewide rate with city labels (Chennai, Coimbatore, Madurai, Trichy) and an adjustable premium per city (default 0 difference). Other states can be added later as a setting. Tamil interface planned from V2, English gold terms alongside.
- **Units:** per gram, **per sovereign (8 g, also called pavan; the unit Tamil Nadu shops quote)**, per 10 g. Karats 24, 22, 18, 14.
- **Purpose:** help the owner and others see live rates, changes and trends, learn about gold, track their own gold privately, and time buying or selling sensibly.

## 3. UX

**Home screen** (six things at most): city label and 22K/24K/18K chips; the rate with a "?" guide beside it; today's change in rupees and percent (green up, red down only); a 7-day line; a one-line plain-words reading such as "cheaper than usual"; two small cards (My Gold value and gain, one Learn tip). Bottom tabs: **Home, Charts, My Gold, Learn**. Alerts, calculator, settings sit under a menu icon.

**Three levels of depth:** glance (home), detail (bottom sheet on tap), explanation (guide).

**Detail sheet** (tap the rate): all karats per gram, per sovereign, per 10 g; day high and low; change vs yesterday, 7 days, 30 days; last-updated time and source; the full build-up (global price, USD/INR, import duty, shop premium).

**Look:** one accent colour, large numbers, lots of space, dark mode, Tamil-first wording. New features (alerts, calculator, comparisons) appear gradually through one-line tips, not extra home buttons.

## 4. Learn tab and guides

Three layers: **micro-guides** (the "?" beside an element, under 80 words, bottom sheet: what it is, how it is worked out, how to read it, one common mistake), the **Learn tab** (lessons in order: Gold basics, Buying wisely, Selling and exchanging, Other ways to hold gold), and a **glossary** (underlined terms: karat, making charges, HUID, sovereign).

| Screen or feature | Guide | Teaches |
| --- | --- | --- |
| Home rate | Reading the rate | 22K vs 24K, gram vs sovereign, why it is indicative, live/delayed dot |
| Change figure | Why the price moves | What the change is measured against; main drivers |
| 7-day line, Charts | Reading charts | Ranges, high, low, average; why one day proves little |
| One-line reading | How the signal works | Four signals, their limits, not advice |
| Detail sheet | How the rate is built | Global price, USD/INR, duty, premium, GST |
| Calculator | What you really pay | Making charges, wastage, GST, fair making charge |
| My Gold | Tracking your gold | Melt value vs shop price, gross vs net weight, why resale returns less |
| Alerts | Setting a useful alert | Target vs percent move; avoiding too many |
| Compare options | Which form suits you | Jewellery, coins and bars, ETF, digital gold |
| Hallmark checklist | Checking purity | BIS logo, carat and fineness, HUID, BIS Care app |
| First launch | Three-card welcome | Only what is needed to read home |

Guides show sources and "last reviewed". The owner reviews each before it ships; the build includes a review sheet listing every guide with a "checked" tick. Duty and GST values come from config so a policy change updates numbers and guides together.

## 5. Data and the rate formula

```
rate24 per gram = XAU_USD_per_oz * USD_INR / 31.1035 * (1 + duty) * (1 + premium)
22K = 24K * 0.916;  18K = 24K * 0.75;  14K = 24K * 0.585;  sovereign = 8 g
GST (3% on gold value, 5% on making charges) is added only in the buy calculator.
```

**Tax and duty facts** (checked 20 Nov 2026): effective import duty **15%** (10% basic customs duty + 5% AIDC) since 13 May 2026, customs notifications 15/2026 and 16/2026 dated 12 May 2026, up from 6%. GST 3% on gold, 5% on making charges. Keep these as settings.

**Sources**

| Source | Use | Notes |
| --- | --- | --- |
| gold-api.com (`https://api.gold-api.com/price/XAU`) | Primary spot, USD per ounce | Terms (effective 10 Sep 2026) allow commercial use, no attribution, data as-is. Repeated requests several per second can get an IP banned, so poll once per 5 minutes from the Worker only. USD only. Live call on 20 Nov returned $3,569.62/oz. |
| Frankfurter (api.frankfurter.dev) | USD/INR | Official reference rates, no key, normally once per working day, so INR moves in daily steps. Untested live. |
| goldprice.dev | Backup spot and 30-day history seed | 5,000 calls/month free, keyless is 15 minutes late. 10-minute polling fits. Attribution required for its widget. |
| OroPocket `api.oropocket.com/public/prices` | Cross-check only | Tradeable buy/sell quotes, 10 requests per 60 s per IP, no SLA. Never label as spot. |
| IBJA (ibjarates.com) | Manual reference only | Copyright reserved; rates exclude 3% GST and making; use for pricing requires IBJA's official API. No automated feed. |
| MJDTA (South India benchmark) | Manual reference only | Published 9:30 and 15:30 IST; pricing use needs a licence from Logimax. |

**One-day check:** spot in rupees was Rs 10,979.87 per gram on 19 Nov; times 1.15 gives Rs 12,627; IBJA 999 was Rs 12,998 per gram, 2.9% higher. So `PREMIUM` starts near 3% against IBJA; Tamil Nadu shop quotes will sit higher. One day is a hint only. Public rate pages disagreed by several percent through November, which is why the log and calibration exist.

**Gold forms** (for guides): 24K = 999 fineness, coins and bars; 22K = 916, traditional jewellery; 18K = 750; 14K = 585. BIS also covers 20K (833) and 23K (958). A hallmark has three parts: BIS logo, carat and fineness, six-digit HUID (verify in the BIS Care app). Sovereign Gold Bonds: no new issues, secondary market only, tax treatment changed. Digital gold: not regulated by SEBI or RBI; SEBI warned the public in November 2025. Gold ETFs and funds need a demat or fund account.

## 6. Architecture (all free tier)

```
price sources -> Rate engine (Worker, cron 5 min) -> Storage (KV latest, D1 history, alert subscriptions)
                       |                                      |
                 Alert checker -> Push (Web Push or FCM) -> Phone PWA <- Rate API (Worker, edge-cached)
```

- PWA served from Cloudflare Pages. Phones never call price sources or hold keys; everyone reads the same cached rate.
- Free limits: Workers 100,000 requests/day, 10 ms CPU, 50 subrequests, 5 cron triggers; KV 100,000 reads and 1,000 writes/day; D1 5 GB and 5 million rows read/day (enforced since 1 Sep 2026); FCM free at any volume. 288 cron runs/day and 288 KV writes/day are far inside limits.
- **Rule:** charts read pre-aggregated hourly and daily rows (about 720 rows for 30 days hourly), cached; raw 5-minute reads (about 8,640 a month) would use up the daily D1 allowance after roughly 580 chart loads.
- Fallbacks: backup source, keep serving last good value marked "delayed", reject a reading that jumps more than `MAX_JUMP`.
- Web Push encryption and fan-out inside the 10 ms CPU limit needs checking when alerts are built; FCM is the likely route.

## 7. My Gold (private holdings)

- Stored only on the device (IndexedDB). No login, no server copy. Ask the browser for persistent storage; one-tap export to a file with optional passphrase; periodic backup reminder (iPhones limit browser storage more tightly). App lock (PIN or fingerprint) is V3.
- Add an item in three entries: form (jewellery, coin, bar, ETF or fund units, other), purity, weight. Optional: stone or other weight (net gold weight), purchase date and shop, price per gram, making charges, GST, HUID and bill number, bill photo (stays on device), family owner.
- Computes: melt value (net weight x purity x live rate); gain or loss vs total paid and vs gold value alone; estimated sale value after a user-set shop deduction (labelled estimate); break-even rate; portfolio stats (24K-equivalent grams, total paid, average cost per gram vs today, split by form and karat, holding period, items ranked by gain).
- Nudges (all calculated on the phone): rate hits a target (push plus in-app banner); rate well below or above average cost (in-app card); monthly check (push says only that it is ready, numbers appear after opening); backup due.
- **Technical limit:** a web app cannot reliably run in the background on a closed phone, so push needs a small price threshold on the server, e.g. "22K at or above X", tied to a push address and never to holdings. In-app-only reminders store nothing on a server. iPhone push works only after Home Screen install (iOS 16.4+).

## 8. Features by phase

| Phase | Features |
| --- | --- |
| MVP (5 to 7 weeks) | Live rate card, change tracker (since last update, yesterday, 7 days), Tamil Nadu rate with city labels, charts (1 day to 3 months, later 1 year; high, low, average), Learn tab and gold guide, cost calculator, My Gold (basic) |
| V2 (about 4 weeks) | Price alerts, buy/sell signal, compare options, offline mode, Tamil interface |
| V3 | Goal planner, festival and season view, app lock, other states |

**Signals (V2):** trend (today vs 20- and 50-day average), momentum (7- and 30-day change), range position (percentile in 90-day range), volatility. Combined into green, amber, red with reasons in words. Back-test on history before going live and publish how often they would have helped. **No forecasts.** Also: staged-buying planner, break-even calculator for jewellery, target alerts, context cards (e.g. the May 2026 duty rise).

## 9. Risks

| Risk | Mitigation |
| --- | --- |
| Free API changes limits or terms | Two sources, own saved history, source swappable in one file |
| App rate differs from the shop | "Indicative" label, source and time on every rate, calibration against IBJA and jewellers |
| iPhone alerts need Home Screen install | In-app install guide, in-app banner fallback |
| Free tier runs out if it grows | Caching, pre-aggregated charts; first paid step is Workers Paid at about $5/month |
| Duty or tax rules change | Defaults kept as settings |
| Signals read as financial advice | Educational labels, published back-tests, lawyer review before public launch |

## 10. Decisions already made

- App name Ibriz; GitHub for code; Cloudflare for hosting; PWA first.
- Tamil Nadu only, Trichy included; sovereign unit shown.
- Beta group skipped for now: the owner is the only user at first, so Gate 2 means the owner uses it daily and trusts the rates.
- Owner will review every guide.
- My Gold is in the MVP (basic), nudges in V2.

## 11. Open questions

- Second USD/INR source needed? (depends on how the daily steps look)
- Svelte or React for the PWA.
- Push route: FCM versus plain Web Push in a Worker.
- Optional custom domain (only likely cost); default is a free `.pages.dev` address.
- Owner's computer: Mac or Windows was asked, not yet answered (affects Terminal instructions).

## 12. Sources opened during planning

- gold-api.com terms: https://gold-api.com/terms
- goldprice.dev: https://goldprice.dev/ and https://goldprice.dev/comparison/best-gold-rate-api-india
- OroPocket endpoint: https://blog.oropocket.com/free-gold-silver-price-api-india/
- IBJA: https://ibjarates.com/ ; MJDTA: https://thejewellersassociation.org/gold-silver-priceapi.php
- Cloudflare limits: https://developers.cloudflare.com/workers/platform/limits ; KV: https://developers.cloudflare.com/kv/platform/limits ; D1 enforcement: https://developers.cloudflare.com/changelog/post/2026-09-01-d1-free-tier-limit-enforcement/
- Import duty 15%: https://jwero.ai/blog/gold-import-duty-india ; https://insightfultrade.com/gold-import-duty-in-india/
- BIS hallmarking: https://services.bis.gov.in/php/BIS_2.0/BISBlog/?p=560 ; https://www.bis.gov.in/hallmarking-overview/hallmarking-faqs/hallmarking-faq
- SEBI digital gold warning: https://www.moneylife.in/article/sebi-warns-against-investing-in-unregulated-digital-gold-and-egold-products/78789.html
- iPhone PWA push: https://www.mobiloud.com/blog/progressive-web-apps-ios ; PWA to Android app: https://web.dev/articles/using-a-pwa-in-your-android-app
- Tamil Nadu uniform rate: https://www.bankbazaar.com/gold-rate-tamil-nadu.html
