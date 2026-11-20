-- One row per update cycle (every 5 minutes). About 105,000 rows a year.
CREATE TABLE IF NOT EXISTS readings (
  ts         INTEGER NOT NULL,  -- time in milliseconds since 1970 (UTC)
  xau_usd    REAL    NOT NULL,  -- gold, US dollars per troy ounce
  usd_inr    REAL    NOT NULL,  -- rupees per US dollar
  spot_inr_g REAL    NOT NULL,  -- gold in rupees per gram, before duty and premium
  rate24     REAL    NOT NULL,  -- indicative 24K rupees per gram after duty and premium
  duty       REAL    NOT NULL,  -- import duty used, e.g. 0.15
  premium    REAL    NOT NULL,  -- shop premium used, e.g. 0.03
  fx_stale   INTEGER NOT NULL DEFAULT 0,  -- 1 if the USD/INR value was old or a fallback
  ok         INTEGER NOT NULL DEFAULT 1   -- 0 if the sanity check rejected this reading
);
CREATE INDEX IF NOT EXISTS idx_readings_ts ON readings (ts);

-- Pre-aggregated rows for charts (the app never reads raw 5-minute rows).
-- bucket = start of the hour / day (UTC ms). Values are 24K rupees per gram.
CREATE TABLE IF NOT EXISTS hourly (
  bucket INTEGER PRIMARY KEY, open REAL NOT NULL, high REAL NOT NULL, low REAL NOT NULL, close REAL NOT NULL, n INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS daily (
  bucket INTEGER PRIMARY KEY, open REAL NOT NULL, high REAL NOT NULL, low REAL NOT NULL, close REAL NOT NULL, n INTEGER NOT NULL
);

-- Price alerts. Anonymous: only a price rule plus a push address, never holdings. The id is a random capability.
CREATE TABLE IF NOT EXISTS alerts (
  id          TEXT PRIMARY KEY,
  endpoint    TEXT NOT NULL,            -- Web Push address of one phone
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  kind        TEXT NOT NULL,            -- price | move | monthly
  karat       INTEGER,
  direction   TEXT,                     -- above | below (price alerts)
  target      REAL,                     -- rupees per gram (price) or percent (move)
  quiet       INTEGER NOT NULL DEFAULT 1,   -- 1 = hold overnight (quiet hours)
  city_adjust REAL NOT NULL DEFAULT 0,  -- the person's city adjustment in percent, so targets match what they see
  city        TEXT NOT NULL DEFAULT '', -- label for the message text only
  active      INTEGER NOT NULL DEFAULT 1,
  created     INTEGER NOT NULL,
  last_fired  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts (active);
CREATE INDEX IF NOT EXISTS idx_alerts_endpoint ON alerts (endpoint);
