<script lang="ts">
  import { onMount } from 'svelte'
  import Screen from '../components/Screen.svelte'
  import ThreadChart from '../components/ThreadChart.svelte'
  import BuysMarks from '../components/BuysMarks.svelte'
  import HeroNumber from '../components/HeroNumber.svelte'
  import { rate } from '../lib/rate.svelte'
  import { settings } from '../lib/settings.svelte'
  import { holdings } from '../lib/holdings.svelte'
  import { href } from '../lib/router.svelte'
  import { fetchHistory, type History, type Range } from '../lib/history'
  import { gainColor, monthYear } from '../lib/mygold-bits'
  import { indian } from '../lib/format'

  // The Worker keeps up to a year of history, so "All" means everything we have.
  const ranges: { id: Range; label: string }[] = [
    { id: '1m', label: '1M' }, { id: '3m', label: '3M' }, { id: '1y', label: '1Y' },
  ]
  let range = $state<Range>('1y')
  let hist = $state<History | null>(null)
  let loading = $state(true)
  async function load() { loading = true; hist = await fetchHistory(range); loading = false }
  onMount(load)
  function pick(r: Range) { range = r; hist = null; load() }

  const karat = $derived(settings.data.karat)
  const k = $derived(rate.purity(karat) * rate.cityFactor)
  const pts = $derived((hist?.points ?? []).map((p) => ({ t: p.t, v: p.v * k })))
  const dated = $derived(holdings.pieces.filter((p) => p.boughtAt).sort((a, b) => a.boughtAt!.localeCompare(b.boughtAt!)))
  const marks = $derived(dated.map((p) => ({ t: Date.parse(p.boughtAt!), label: p.name })))
  const first = $derived(dated[0])
  const today = $derived(rate.perGram(karat))
  const sincePct = $derived(first?.pricePerGram ? ((today - first.pricePerGram) / first.pricePerGram) * 100 : null)
  function change(p: (typeof dated)[number]) {
    if (!p.pricePerGram) return null
    return ((rate.perGram(p.karat) - p.pricePerGram) / p.pricePerGram) * 100
  }
  function nextKarat() {
    const ks = rate.config.karats
    settings.set('karat', ks[(ks.indexOf(karat) + 1) % ks.length])
  }
</script>

<Screen tab="charts">
  <header class="rise top">
    <h1 class="serif">Charts</h1>
    <span class="acts">
      <a href={href('charts')} class="chip on">My buys</a>
      <button type="button" class="chip mono" onclick={nextKarat} aria-label="Change purity, now {karat} karat">{karat}K</button>
    </span>
  </header>

  <div class="rise tabs" role="tablist" aria-label="Chart range" style="--d:.06s">
    {#each ranges as r}
      <button type="button" role="tab" aria-selected={r.id === range} class="tab mono" class:on={r.id === range} onclick={() => pick(r.id)}>{r.label}<i></i></button>
    {/each}
  </div>

  <div class="rise read" style="--d:.12s">
    <p class="mono cap">{first ? 'Since your first buy · ' + monthYear(first.boughtAt) : 'Add a purchase date to a piece to see it here'}</p>
    <div class="big"><span class="rs">₹</span><HeroNumber value={today} size={58} /></div>
    {#if sincePct !== null && first?.pricePerGram}
      <p class="sub"><span class="mono" style="color:{gainColor(sincePct)}">{sincePct < 0 ? '−' : '+'}{Math.abs(Math.round(sincePct))}%</span> from <span class="mono">₹{indian(Math.round(first.pricePerGram))}</span> a gram</p>
    {/if}
  </div>

  <figure class="chart" aria-label="{karat} karat with your purchases marked">
    {#if loading}
      <div class="shimmer" style="height:2px;margin-top:90px"></div>
    {:else if pts.length < 2}
      <p class="none">Not enough history yet for this range.</p>
    {:else}
      {#key range + ':' + pts.length}<ThreadChart points={pts} height={200} live={rate.status === 'live'} />{/key}
      <BuysMarks points={pts} {marks} height={200} />
    {/if}
  </figure>
  <p class="rise help">We keep about a year of daily history. Older buys are listed below but can't be drawn.</p>

  <div class="list">
    {#each dated as p, i}
      {@const c = change(p)}
      <div class="row rise" style="--d:{0.2 + i * 0.05}s">
        <span class="nm"><span>{p.name}</span><span class="meta">{monthYear(p.boughtAt)}{p.pricePerGram ? ' · rate then ' : ''}{#if p.pricePerGram}<span class="mono">₹{indian(Math.round(p.pricePerGram))}</span>{/if}</span></span>
        <span class="mono" style="color:{gainColor(c)}">{c === null ? '' : (c < 0 ? '−' : '+') + Math.abs(c).toFixed(1) + '%'}</span>
      </div>
    {/each}
    {#if !dated.length}<p class="none">Pieces with a purchase date appear here.</p>{/if}
  </div>
</Screen>

<style>
  .top { display: flex; align-items: center; justify-content: space-between; height: 44px; }
  h1 { font-size: 30px; letter-spacing: -0.01em; }
  .acts { display: flex; gap: 8px; }
  .chip { height: 36px; padding: 0 14px; display: flex; align-items: center; border: 1px solid var(--line); border-radius: 18px; font-size: 13px; color: var(--ink-2); }
  .chip.on { background: var(--raised); color: var(--ink); border-color: color-mix(in srgb, var(--gold) 55%, transparent); }
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
  .chart { position: relative; margin: 20px calc(var(--pad) * -1) 0; height: 224px; }
  .help { font-size: 12px; color: var(--ink-3); margin-top: 8px; }
  .list { margin-top: 14px; }
  .nm { display: flex; flex-direction: column; gap: 3px; }
  .meta { font-size: 12px; color: var(--ink-3); }
  .none { margin: 24px 0; font-size: 14px; color: var(--ink-2); }
</style>
