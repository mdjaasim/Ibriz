<script lang="ts">
  import { onMount } from 'svelte'
  import Screen from '../components/Screen.svelte'
  import GuideLink from '../components/GuideLink.svelte'
  import ThreadChart from '../components/ThreadChart.svelte'
  import HeroNumber from '../components/HeroNumber.svelte'
  import { rate } from '../lib/rate.svelte'
  import { settings } from '../lib/settings.svelte'
  import { href } from '../lib/router.svelte'
  import { fetchHistory, coversRange, type History, type Range } from '../lib/history'
  import { indian, shortDate, clockTime } from '../lib/format'

  const ranges: { id: Range; label: string; words: string }[] = [
    { id: '1d', label: '1D', words: 'today' }, { id: '1w', label: '1W', words: 'this week' }, { id: '1m', label: '1M', words: 'this month' },
    { id: '3m', label: '3M', words: 'these 3 months' }, { id: '1y', label: '1Y', words: 'this year' },
  ]
  let range = $state<Range>(rate.config.chartDefaultRange as Range)
  let hist = $state<History | null>(null)
  let loading = $state(true)
  async function load() { loading = true; hist = await fetchHistory(range); loading = false }
  onMount(load)
  function pick(r: Range) { range = r; hist = null; load() }

  const karat = $derived(settings.data.karat)
  const k = $derived(rate.purity(karat) * rate.cityFactor)
  const pts = $derived((hist?.points ?? []).map((p) => ({ t: p.t, v: p.v * k })))
  const today = $derived(rate.perGram(karat))
  const high = $derived(pts.length ? pts.reduce((a, b) => (b.v > a.v ? b : a)) : null)
  const low = $derived(pts.length ? pts.reduce((a, b) => (b.v < a.v ? b : a)) : null)
  const avg = $derived(hist?.average != null ? hist.average * k : null)
  const first = $derived(pts[0] ?? null)
  const change = $derived(first ? today - first.v : null)
  const words = $derived(ranges.find((r) => r.id === range)!.words)
  let scrub = $state<{ t: number; v: number } | null>(null)
  const shown = $derived(scrub ? scrub.v : today)
  const diff = $derived(scrub ? scrub.v - today : null)
  const dayTime = (t: number) => (range === '1d' ? clockTime(t) : shortDate(t))
  function nextKarat() {
    const ks = rate.config.karats
    settings.set('karat', ks[(ks.indexOf(karat) + 1) % ks.length])
  }
</script>

<Screen tab="charts">
  <header class="rise top">
    <h1 class="serif">Charts</h1>
    <span class="acts">
      <GuideLink id="reading-the-chart" />
      <a href={href('chartsbuys')} class="chip">My buys</a>
      <button type="button" class="chip mono" onclick={nextKarat} aria-label="Change purity, now {karat} karat">{karat}K</button>
    </span>
  </header>

  <div class="rise tabs" role="tablist" aria-label="Chart range" style="--d:.06s">
    {#each ranges as r}
      <button type="button" role="tab" aria-selected={r.id === range} class="tab mono" class:on={r.id === range} onclick={() => pick(r.id)}>{r.label}<i></i></button>
    {/each}
  </div>

  <div class="rise read" aria-live="polite" style="--d:.12s">
    <p class="mono cap">{scrub ? dayTime(scrub.t) : 'Today'} · {karat}K per gram</p>
    <div class="big">
      {#key scrub ? 's' : 'n' + range}
        <span class="rs">₹</span><HeroNumber value={shown} size={58} />
      {/key}
    </div>
    <p class="sub">
      {#if diff !== null}
        <span class="mono">₹{indian(Math.abs(Math.round(diff)))}</span> {diff >= 0 ? 'more' : 'less'} than today
      {:else if change !== null}
        <span class="mono" style="color:var(--{change < 0 ? 'down' : 'up'})">{change < 0 ? '−' : '+'}₹{indian(Math.abs(Math.round(change)))}</span> {words === 'today' ? 'since the start of the day' : 'since ' + (first ? shortDate(first.t) : '')}
      {:else}Waiting for history to build up.{/if}
    </p>
  </div>

  <figure class="chart" aria-label="{karat} karat over {words}">
    {#if loading}
      <div class="shimmer" style="height:2px;margin-top:80px"></div>
    {:else if pts.length < 2}
      <p class="none">Not enough history yet for this range. The log fills in as the engine runs; longer ranges need more days.</p>
    {:else}
      {#key range + ':' + pts.length}<ThreadChart points={pts} height={200} intraday={range === '1d'} live={rate.status === 'live'} onscrub={(p) => (scrub = p)} />{/key}
    {/if}
  </figure>

  {#if hist && pts.length > 1 && !coversRange(hist.points, range)}
    <p class="cov">History so far starts {shortDate(hist.points[0].t)}. Ibriz keeps what it collects, so longer ranges fill in over time.</p>
  {/if}

  {#if pts.length > 1}
    <section class="rise stats" aria-label="Range summary">
      <div class="stat"><span class="l">High</span><span class="mono">₹{indian(Math.round(high!.v))}</span><span class="d">{shortDate(high!.t)}</span></div>
      <div class="stat"><span class="l">Low</span><span class="mono">₹{indian(Math.round(low!.v))}</span><span class="d">{shortDate(low!.t)}</span></div>
      <div class="stat"><span class="l">Average</span><span class="mono">{avg !== null ? '₹' + indian(Math.round(avg)) : '–'}</span><span class="d">{words[0].toUpperCase() + words.slice(1)}</span></div>
      <div class="stat"><span class="l">Change</span><span class="mono" style="color:var(--{(change ?? 0) < 0 ? 'down' : 'up'})">{(change ?? 0) < 0 ? '−' : '+'}₹{indian(Math.abs(Math.round(change ?? 0)))}</span><span class="d">{first ? (((change ?? 0) / first.v) * 100).toFixed(1).replace('-', '−') + '% since ' + shortDate(first.t) : ''}</span></div>
    </section>
  {/if}
  <a href={href('context')} class="rise ctxrow">
    <span>What moved the price</span><span class="ctxv">Dated changes and big days →</span>
  </a>

  <p class="rise note">{karat}K gold, price for 1 gram in {settings.data.city}. {range === '1d' ? 'One point per hour.' : 'One point per day, closing rate.'} Drag across the line to read a day. The top and bottom labels are the highest and lowest in this range; the gold one is now. Past prices, for learning. Not a forecast. Earlier days via <a href="https://goldprice.dev" target="_blank" rel="noopener noreferrer" class="lk">goldprice.dev</a>.</p>
</Screen>

<style>
  .top { display: flex; align-items: center; justify-content: space-between; height: 44px; }
  h1 { font-size: 30px; letter-spacing: -0.01em; }
  .acts { display: flex; gap: 8px; }
  .chip { height: 36px; padding: 0 14px; display: flex; align-items: center; border: 1px solid var(--line); border-radius: 18px; font-size: 13px; color: var(--ink-2); }
  .tabs { display: flex; margin: 14px -10px 0; }
  .tab { height: 44px; min-width: 44px; padding: 0 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; font-size: 12px; color: var(--ink-3); }
  .tab.on { color: var(--ink); }
  .tab i { width: 14px; height: 1px; }
  .tab.on i { background: var(--gold); }
  .read { margin-top: 14px; }
  .cap { font-size: 12px; color: var(--ink-3); }
  .big { display: flex; align-items: flex-start; height: 64px; margin-top: 6px; }
  .rs { font-size: 24px; font-weight: 300; color: var(--gold-text); margin: 8px 5px 0 0; }
  .sub { margin-top: 6px; font-size: 14px; color: var(--ink-2); }
  .chart { margin: 20px 0 0; min-height: 200px; position: relative; }
  .none { margin: 40px var(--pad); font-size: 14px; color: var(--ink-2); line-height: 1.5; }
  .stats { margin-top: 16px; display: grid; grid-template-columns: 1fr 1fr; }
  .stat { display: flex; flex-direction: column; gap: 4px; padding: 14px 0; border-top: 1px solid var(--line); }
  .stat:nth-child(odd) { padding-right: 12px; }
  .l { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); }
  .stat .mono { font-size: 17px; }
  .d { font-size: 12px; color: var(--ink-3); }
  .note { margin-top: 12px; font-size: 12px; color: var(--ink-3); }
  .lk { text-decoration: underline; text-underline-offset: 3px; }
  .cov { margin: 10px 0 0; font-size: 12px; color: var(--ink-3); line-height: 1.4; }
  .ctxrow { display: flex; align-items: center; justify-content: space-between; min-height: 50px; margin-top: 16px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); font-size: 15px; }
  .ctxv { font-size: 13px; color: var(--gold-text); }
</style>
