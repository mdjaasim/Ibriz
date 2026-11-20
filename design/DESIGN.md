# Ibriz design spec

Approved by Jaasim on 21 Nov 2026. This folder is the source of truth for the app's look and behaviour. Build exactly this; ask before changing it.

- `screens/` — every approved screen as a 2x PNG (390 px wide phone screens; `Menu.png` is a 1000 px tall scroll; `Brand.png` is the brand board).
- `prototype/` — the same screens as standalone HTML. Open `prototype/index.html` in a browser; every button and row links to the next screen. Read these files for exact sizes, spacing, colours and copy.
- `tokens.css` — colours (night and day), fonts, spacing, radii and motion as CSS variables.
- Live design canvas (for comments and Play mode): https://claude.ai/artifact/Yaofk1EuqUq2L5Di8BiF3U

Numbers in the mock-ups are sample data: rates follow the indicative formula for 20 Nov 2026; chart history and My Gold pieces are samples. Real values come from the rate engine and the user's device.

## 1. Direction: quiet bullion

Warm near-black, one champagne-gold accent, serif numerals for the figures that matter, a clean sans for everything you read. No cards, boxes, gradients-as-decoration, emoji or icon soup: hairlines and space carry the layout. Every screen leads with one number; detail is one tap deeper (glance → bottom sheet → guide).

## 2. Type

| Use | Family | Size / style |
| --- | --- | --- |
| Hero rate (Today) | Bodoni Moda | 86 px, weight 400, letter-spacing −0.02em, digits roll in |
| Screen heroes (Charts readout, My Gold worth, What if) | Bodoni Moda | 42–58 px |
| Screen titles | Bodoni Moda | 30 px (sheets 26–28 px) |
| Onboarding headlines | Bodoni Moda | 36–46 px, italic for the second line on Welcome |
| Editorial reading line | Bodoni Moda italic | 25 px / 1.22 |
| Body, rows | Geist | 15 px rows, 14 px secondary, 16 px / 1.68 for lesson text |
| Labels | Geist 500 | 11 px, uppercase, letter-spacing 0.14em, `--ink-3` |
| Figures in rows, tables, tabs | Geist Mono, tabular | 12–17 px |
| Tamil | Anek Tamil | falls back automatically through the font stacks |

Rupee amounts: the ₹ sign is Geist light, gold, at about 40% of the number's size and raised; in serif numbers, commas are 55–60% size with a little space either side. Use Indian grouping (₹5,51,081), the real minus sign (−), "a gram" rather than "/g" in sentences.

## 3. Colour

Night is the default; Day is a full alternative theme (see `TodayDay.png`). Gold is the only accent. Green and red mean up and down only (red also marks destructive actions and unregulated products). Text contrast is 4.5:1 or better, including the small grey labels.

## 4. Components

- **Wordmark:** "ıbrız" in Bodoni Moda with dotless i's; each dot is a small gold diamond (`.wm` in any prototype file).
- **Text tab bar:** Today · Charts · My Gold · Learn, 13 px, active tab in `--ink` with a 4 px gold diamond under it; never more than four tabs.
- **Purity and range tabs:** mono text, selected one in `--ink` with a gold diamond (purity) or 14 px gold underline (range).
- **Hero number:** each digit is a column that rolls from 0 to its value, staggered 60 ms, `--ease`, 1.5 s.
- **Change line:** arrow icon + ₹ change + % in up/down colour, then "since yesterday" in `--ink-3`.
- **Thread chart:** full-bleed 1.6 px gold line that draws itself; faint gold fade beneath (max 10% opacity); dotted line at today's level; pulsing live dot. Scrubbing dims the line after the finger and swaps the readout.
- **Bottom sheet:** `--sheet`, 28 px top radius, grabber, springs up with `--ease-spring`; content behind is dimmed with `--scrim`.
- **Ladder** ("how it's built", calculator results): vertical gold hairline with ringed nodes, values right-aligned in mono, the total on a gold diamond in large serif.
- **Rows:** 50–58 px, hairline divider, value and chevron on the right.
- **Buttons:** primary = gold fill, `--on-gold` text, 54 px, 16 px radius; secondary = hairline outline; destructive = soft red tint with red text.
- **Chips, segmented control, toggle, slider:** chips 40 px pills; segmented control in a hairline pill with the selected segment raised; toggle on = gold; slider knob = gold diamond with a soft halo.
- **Inputs:** the value is a large serif number on a gold underline, unit beside it; no fake keyboards in designs.
- **Comparison visuals:** dumbbell rows (paid per gram → today) on one shared scale with a gold "Today" line; range bar (paid, month low–high band, today diamond).
- **States:** shimmer skeleton shaped like the content (digit columns for the number); offline banner on `--raised` with the last rate time; Live/Offline tag beside the range tabs.

## 5. Motion

One curve for everything (`--ease`): elements rise 10 px and fade in over 900 ms with a 40–100 ms stagger; digits roll 1.5 s; lines draw 1.8 s; sheets spring 800 ms; the live dot pulses every 2.4 s. Nothing loops except the live dot, the loading shimmer and the input caret. Respect `prefers-reduced-motion` (all durations become 0).

## 6. Words

Plain English, sentence case, no jargon without a glossary link. Rates are always "indicative", with source and time nearby. Readings and signals are "for learning, not advice"; never say buy or sell. My Gold always reminds the user that it is "Kept only on this phone". Tamil copy is a first draft and must be checked by a native speaker before release.

## 7. Screens

| Screen | File | Reached from |
| --- | --- | --- |
| Brand board | `Brand` | (portfolio) |
| Today | `Main` | app start, tab bar |
| Rate detail | `RateSheet` | tap the rate; Menu › How rates are worked out |
| Guide ("?") | `Guide` | ? beside the rate |
| Charts | `Charts` | tab bar |
| Charts with your buys | `ChartsBuys` | Charts › My buys |
| My Gold | `MyGold` | tab bar, Today row |
| My Gold, empty | `MyGoldEmpty` | first visit with no pieces |
| Add a piece / details | `AddPiece`, `AddDetails` | + on My Gold, calculator "Save to My Gold" |
| One piece | `PieceDetail` | a piece row |
| Remove a piece | `RemoveConfirm` | One piece › Remove |
| Compare: bought vs today / ranges / what if | `CompareBuys`, `GoldRanges`, `WhatIf` | My Gold › Compare your gold (shared tab bar) |
| Back up | `Backup` | Menu |
| Learn | `Learn` | tab bar |
| Lesson | `Lesson` | Learn, Today row, guides |
| Glossary | `Glossary` | Learn, underlined terms |
| Hallmark check | `Hallmark` | Menu › Tools |
| Ways to hold gold | `Compare` | Menu › Tools |
| Calculator: buying / selling | `Calculator`, `Sell` | Menu › Tools (segmented switch between them) |
| See why | `SeeWhy` | Today › See why |
| Alerts / new alert | `Alerts`, `NewAlert` | Menu, Charts, My Gold nudges |
| How alerts arrive | `Notifications` | (spec board: notification copy and app icon) |
| Welcome, city, Home Screen install | `Welcome`, `OnbCity`, `OnbInstall` | first launch |
| City sheet / adjust premium | `CityPicker`, `AdjustPremium` | city name on Today, Menu |
| Menu | `Menu` | menu icon on Today |
| Sources and terms | `Sources` | Menu, guides |
| Day theme, Tamil, offline, loading | `TodayDay`, `TodayTamil`, `TodayOffline`, `TodayLoading` | theme, language, network states |

Not drawn but needed, built from the same components: saved/backed-up confirmations (toast on `--raised`), empty alerts list, theme and language pickers (row lists with a gold diamond on the selection).

## 8. For the build

- Fonts load from Google Fonts (`tokens.css` imports them). Fall back gracefully.
- Use the CSS variables, not hex values, so Day theme works everywhere.
- Today's hero, change line and karat rates map to the rate engine's `/api/rate` (`rates[22].perGram`, `change24h`, `rates[k].perSovereign`, `updatedAt`, `fxStale`).
- The `.html` prototype files are reference markup, not production code: rebuild them as components.
- Touch targets ≥ 44 px; real `<button>`, `<a>` and `<input>` elements; `aria-label` on icon-only buttons.
