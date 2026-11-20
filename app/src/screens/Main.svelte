<script lang="ts">
  import { onMount } from 'svelte'
  import Screen from '../components/Screen.svelte'
  import Wordmark from '../components/Wordmark.svelte'
  import HeroNumber from '../components/HeroNumber.svelte'
  import ThreadChart from '../components/ThreadChart.svelte'
  import Money from '../components/Money.svelte'
  import Chevron from '../components/Chevron.svelte'
  import { rate } from '../lib/rate.svelte'
  import { settings } from '../lib/settings.svelte'
  import { holdings } from '../lib/holdings.svelte'
  import { href } from '../lib/router.svelte'
  import { fetchHistory, coversRange, type History, type Range } from '../lib/history'
  import { readingFor } from '../lib/reading'
  import { clockTime, indian, pct, shortDate, signed } from '../lib/format'
  import { lessons } from '../content/lessons'

  const ranges: { id: Range; label: string }[] = [
    { id: '1d', label: '1D' }, { id: '1w', label: '1W' }, { id: '1m', label: '1M' }, { id: '3m', label: '3M' }, { id: '1y', label: '1Y' },
  ]
  let range = $state<Range>(rate.config.chartDefaultRange as Range)
  let hist = $state<History | null>(null)
  onMount(() => { load() })
  async function load() { hist = await fetchHistory(range) }
  function pick(r: Range) { range = r; hist = null; load() }

  const karat = $derived(settings.data.karat)
  const pts = $derived((hist?.points ?? []).map((p) => ({ t: p.t, v: p.v * rate.purity(karat) * rate.cityFactor })))
  const chg = $derived(rate.change(karat))
  const down = $derived((chg?.abs ?? 0) < 0)
  const reading = $derived(readingFor(hist && { ...hist, points: pts, high: hist.high && hist.high * rate.purity(karat) * rate.cityFactor, low: hist.low && hist.low * rate.purity(karat) * rate.cityFactor }, rate.perGram(karat)))
  const tip = $derived(lessons[0])
  const s = $derived(holdings.summary)
  let scrub = $state<{ t: number; v: number } | null>(null)
</script>

<Screen tab="main" glow>
  <header class="rise top">
    <Wordmark />
    <div class="right">
      <a href={href('citypicker')} class="city">{settings.data.city}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="var(--ink-3)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
      <a href={href('menu')} class="menu" aria-label="Menu">
        <svg width="20" height="10" viewBox="0 0 20 10" fill="none" aria-hidden="true"><path d="M1 1h18M7 9h12" stroke="var(--ink-2)" stroke-width="1.3" stroke-linecap="round"/></svg>
      </a>
    </div>
  </header>

  <div class="rise tabs" style="--d:.06s">
    <div role="tablist" aria-label="Purity" class="purity">
      {#each rate.config.karats as k}
        <button type="button" role="tab" aria-selected={k === karat} class="tab mono" class:on={k === karat} onclick={() => settings.set('karat', k)}>{k}K<i></i></button>
      {/each}
    </div>
    <a href={href('guide')} class="q" aria-label="What this rate means"><span>?</span></a>
  </div>

  {#if rate.status === 'loading' && !rate.latest}
    <div class="skel" aria-busy="true" aria-label="Loading the rate">
      <div class="shimmer" style="height:78px;width:70%"></div>
      <div class="shimmer" style="height:16px;width:50%;margin-top:14px"></div>
      <div class="shimmer" style="height:2px;margin-top:90px"></div>
    </div>
  {:else if !rate.latest}
    <p class="empty">Can't reach the rate right now. Check your connection and try again.</p>
  {:else}
    {#if rate.status === 'offline'}
      <div class="banner">You're offline. Showing the rate from {clockTime(rate.latest.updatedAt)}.</div>
    {/if}
    <a href={href('ratesheet')} class="hero" aria-label="{karat} karat, {indian(Math.round(rate.perGram(karat)))} rupees per gram. Open details">
      <span class="rise rs" style="--d:.1s">₹</span>
      <HeroNumber value={rate.perGram(karat)} />
    </a>

    {#if chg}
      <div class="rise change" style="--d:.5s">
        <span class="mono delta" style="color:var(--{down ? 'down' : 'up'})">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">{#if down}<path d="M5 1v8M1.5 5.5 5 9l3.5-3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>{:else}<path d="M5 9V1M1.5 4.5 5 1l3.5 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>{/if}</svg>
          ₹{indian(Math.abs(Math.round(chg.abs)))}
        </span>
        <span class="mono" style="font-size:13px;color:var(--{down ? 'down' : 'up'})">{pct(chg.pct)}</span>
        <span class="since">since yesterday</span>
      </div>
    {:else}
      <div class="rise change" style="--d:.5s"><span class="since">Change shows after the first full day.</span></div>
    {/if}
    <div class="rise sov" style="--d:.56s"><span class="mono ink"><Money value={Math.round(rate.perSovereign(karat))} size={14} /></span> per sovereign, {rate.config.gramsPerSovereign} g</div>

    <figure class="chart" aria-label="{karat} karat rate over the selected range">
      <figcaption class="cap rise" style="--d:.6s">
        {#if scrub}
          <span class="mono">₹{indian(Math.round(scrub.v))}</span> on {range === '1d' ? clockTime(scrub.t) : shortDate(scrub.t)}
        {:else}
          {karat}K gold, price for 1 gram in {settings.data.city}. {range === '1d' ? 'One point per hour, today.' : 'One point per day, closing rate.'}
        {/if}
      </figcaption>
      {#key range + ':' + pts.length}<ThreadChart points={pts} height={170} intraday={range === '1d'} live={rate.status === 'live'} onscrub={(p) => (scrub = p)} />{/key}
    </figure>

{#if hist && pts.length > 1 && !coversRange(hist.points, range)}<p class="cov">History so far starts {shortDate(hist.points[0].t)}. Ibriz keeps what it collects, so longer ranges fill in over time.</p>{/if}
    <div class="rise rangebar" style="--d:.7s">
      <div role="tablist" aria-label="Chart range" class="ranges">
        {#each ranges as r}
          <button type="button" role="tab" aria-selected={r.id === range} class="tab mono" class:on={r.id === range} onclick={() => pick(r.id)}>{r.label}<i></i></button>
        {/each}
      </div>
      <span class="mono live"><i class:off={rate.status !== 'live'}></i>{rate.status === 'live' ? 'Live' : rate.status === 'offline' ? 'Offline' : 'Delayed'} · {clockTime(rate.latest.updatedAt)}</span>
    </div>

    <div class="rise reading" style="--d:.85s">
      <p class="serif">{reading.line}</p>
      <a href={href('seewhy')} class="why">See why<svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true"><path d="M1 5h11M8.5 1.5 12 5 8.5 8.5" stroke="var(--gold-text)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
    </div>

    <nav class="rise short" aria-label="Shortcuts" style="--d:.95s">
      <a href={href('mygold')} class="row">
        <span>My Gold</span>
        <span class="vals">
          {#if s.count}
            <Money value={Math.round(s.worth)} size={14} />
            {#if s.gainPct !== null}<span class="mono" style="font-size:12px;color:var(--{s.gainPct < 0 ? 'down' : 'up'})">{s.gainPct < 0 ? '−' : '+'}{pct(s.gainPct, 1)}</span>{/if}
          {:else}<span class="sub">Add your first piece</span>{/if}
          <Chevron />
        </span>
      </a>
      <a href={href('lesson', tip.id)} class="row">
        <span>Learn</span>
        <span class="vals"><span class="sub">{tip.title}</span><Chevron /></span>
      </a>
    </nav>
  {/if}
</Screen>

<style>
  .top { position: relative; display: flex; align-items: center; justify-content: space-between; height: 44px; }
  .right { display: flex; align-items: center; gap: 4px; }
  .city { display: flex; align-items: center; gap: 6px; height: 44px; padding: 0 10px; font-size: 14px; color: var(--ink-2); }
  .menu { width: 44px; height: 44px; display: flex; align-items: center; justify-content: flex-end; }
  .tabs { position: relative; display: flex; align-items: center; justify-content: space-between; height: 44px; margin-top: 18px; }
  .purity, .ranges { display: flex; }
  .purity { gap: 18px; }
  .tab { height: 44px; min-width: 44px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; font-size: 13px; color: var(--ink-3); }
  .tab.on { color: var(--ink); }
  .tab i { width: 4px; height: 4px; }
  .purity .on i { background: var(--gold); transform: rotate(45deg); }
  .ranges .tab { font-size: 12px; }
  .ranges .tab i { width: 14px; height: 1px; }
  .ranges .on i { background: var(--gold); }
  .q { width: 44px; height: 44px; display: flex; align-items: center; justify-content: flex-end; }
  .q span { width: 26px; height: 26px; border-radius: 50%; border: 1px solid var(--line); display: flex; align-items: center; justify-content: center; font-size: 13px; color: var(--ink-2); }
  .hero { position: relative; margin: 10px 0 0 -2px; display: flex; align-items: flex-start; height: 96px; }
  .rs { font-size: 28px; font-weight: 300; color: var(--gold-text); margin: 14px 6px 0 0; }
  .change { display: flex; align-items: center; gap: 10px; margin-top: 6px; height: 22px; }
  .delta { display: flex; align-items: center; gap: 5px; font-size: 13px; }
  .since { font-size: 13px; color: var(--ink-3); }
  .sov { margin-top: 4px; font-size: 14px; color: var(--ink-2); }
  .ink { color: var(--ink); }
  .chart { position: relative; margin: 14px 0 0; }
  .cov { font-size: 12px; color: var(--ink-3); margin: 4px 0 0; line-height: 1.4; }
  .cap { font-size: 12px; color: var(--ink-3); margin-bottom: 8px; min-height: 16px; }
  .cap .mono { color: var(--ink); }
  .rangebar { display: flex; align-items: center; justify-content: space-between; margin: 2px -10px 0; }
  .live { display: flex; align-items: center; gap: 7px; font-size: 11px; color: var(--ink-3); padding-right: 10px; }
  .live i { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); }
  .live i.off { background: var(--ink-3); }
  .reading { margin-top: 18px; }
  .reading p { font-size: 25px; line-height: 1.22; font-style: italic; letter-spacing: -0.005em; text-wrap: balance; }
  .why { display: inline-flex; align-items: center; gap: 6px; height: 32px; font-size: 13px; color: var(--gold-text); }
  .short { margin-top: 8px; }
  .vals { display: flex; align-items: center; gap: 10px; }
  .sub { font-size: 14px; color: var(--ink-2); }
  .skel { margin-top: 24px; }
  .empty, .banner { margin-top: 24px; font-size: 14px; color: var(--ink-2); }
  .banner { background: var(--raised); padding: 12px 14px; border-radius: 12px; margin-top: 12px; }
  @media (max-height: 760px) { .reading p { font-size: 22px; } }
</style>
