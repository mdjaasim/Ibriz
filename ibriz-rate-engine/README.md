# Ibriz rate engine (prototype v0.1)

A small program that runs on Cloudflare for free. Every 5 minutes it:

1. asks gold-api.com for the world gold price (US dollars per ounce),
2. asks a free exchange-rate source for dollars to rupees,
3. converts that to an **indicative** Indian 24K rate per gram (adds the 15% import duty and a small shop premium),
4. saves the reading in a log and publishes the latest rate at a web address.

For the first week its only job is to build that log, so we can check how close the formula is to real Tamil Nadu shop rates. The Ibriz app itself comes after.

Nothing here costs money. No card is needed.

---

## 1. Put the files in your GitHub repository

You have an empty repository. Easiest way, no terminal needed:

1. Unzip `ibriz-rate-engine.zip` on your computer.
2. Open your repository on github.com, click **Add file**, then **Upload files**.
3. Drag in everything from inside the unzipped folder (including the `src`, `test`, `scripts` and `calibration` folders and the files beside them), then click **Commit changes**.

## 2. Set up your computer (once)

1. Install Node.js (the "LTS" version) from https://nodejs.org.
2. Open the **Terminal** app.
3. Get the files onto your computer and open the folder. If you uploaded to GitHub:

   ```
   git clone https://github.com/YOUR-NAME/ibriz.git
   cd ibriz
   ```

   (or just `cd` into the unzipped folder).
4. Install the tools:

   ```
   npm install
   ```

5. Check everything works before touching Cloudflare:

   ```
   npm test
   ```

   You should see `pass 13` and `fail 0`.

## 3. Connect to Cloudflare (once)

Run these one at a time.

```
npx wrangler login
```

A browser window opens. Log in to your free Cloudflare account and allow access.

```
npx wrangler kv namespace create RATES
```

It prints an `id`. Open `wrangler.toml`, and replace `REPLACE_WITH_KV_ID` with that id.

```
npx wrangler d1 create ibriz
```

It prints a `database_id`. In `wrangler.toml`, replace `REPLACE_WITH_D1_ID` with it.

```
npx wrangler d1 execute ibriz --remote --file=schema.sql
```

This creates the table that holds the log.

Optional but recommended: protect the log and the manual-run link with a password of your choice.

```
npx wrangler secret put LOG_TOKEN
```

Type a password when asked. Remember it.

## 4. Go live

```
npx wrangler deploy
```

At the end it prints your address, like `https://ibriz-rates.YOUR-NAME.workers.dev`. Save the changes to GitHub too (`git add . && git commit -m "Set up Cloudflare" && git push`), but do not worry if you skip this for now.

## 5. Check that it works

Wait about 5 minutes (or force a run, see below), then open these in your browser:

- `YOUR-ADDRESS/api/health` should say `"ok": true`.
- `YOUR-ADDRESS/api/rate` shows the latest rate for 24K, 22K, 18K and 14K, per gram, per sovereign (8 g) and per 10 g, plus the change over 24 hours (empty on day one).

To force a run right now (only works if you set `LOG_TOKEN`):

```
YOUR-ADDRESS/api/run?token=YOUR-PASSWORD
```

If it shows an error, copy the message and send it to me. The most likely cause is the exchange-rate source: I wrote the code from its documentation but could not test it live. The error will say which step failed.

## 6. The one-week check

Each day, note two real rates in `calibration/quotes.csv`, one line each:

```
date_time_ist,karat,price_per_gram,source
2026-11-24 11:30,22,12470,Chennai jeweller
2026-11-24 11:32,24,12998,IBJA
```

- Write the price per gram **before GST and before making charges**.
- Use the time you actually saw the rate (Indian time).
- Two or three a day from a couple of sources is plenty: the IBJA rate, and a big Chennai or Trichy jeweller's board.

After 7 days, download the log (in the browser, then save the page as `log.csv`):

```
YOUR-ADDRESS/api/log.csv?days=14&token=YOUR-PASSWORD
```

Then run:

```
npm run calibrate -- log.csv calibration/quotes.csv
```

It prints, for every quote, the shop premium it implies, plus the median per source. Send me that output and we will set `PREMIUM` in `wrangler.toml` to a value that fits Tamil Nadu.

---

## What each file is

| File | Purpose |
| --- | --- |
| `src/rate.js` | The maths: spot price to Indian rate, karats, sovereign, change, sanity check |
| `src/sources.js` | Talks to gold-api.com and the exchange-rate source |
| `src/update.js` | One update cycle: fetch, calculate, log, publish |
| `src/index.js` | The web addresses and the 5-minute timer |
| `schema.sql` | The log table |
| `wrangler.toml` | Settings: import duty (15%), premium (3% to start), jump limit, timer |
| `test/` | 13 automatic checks of the maths and the update cycle |
| `scripts/calibrate.mjs` | Compares our rates with your noted quotes |

## Things to know

- **The rate is indicative.** It is global gold converted to rupees plus duty and a premium. It is not any shop's board rate.
- **The rupee rate may move in daily steps.** The free exchange-rate source normally publishes once per working day. If that makes the rate look jumpy, we add a second source later.
- **Safety check.** A reading that differs from the last by more than 5% is logged but not published. After 3 such readings in a row the new level is accepted, because the market really moved.
- **Free limits.** 288 runs a day is far below Cloudflare's free allowance of 100,000 requests a day.
- **Changing the duty.** If the government changes import duty, edit `DUTY` in `wrangler.toml` and run `npx wrangler deploy`.
