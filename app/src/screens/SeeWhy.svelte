<script lang="ts">
  import { href } from '../lib/router.svelte'
  import { onMount } from 'svelte'
  import Main from './Main.svelte'
  import Sheet from '../components/Sheet.svelte'
  import { rate } from '../lib/rate.svelte'
  import { settings } from '../lib/settings.svelte'
  import { fetchHistory, type History } from '../lib/history'
  import { readingFor } from '../lib/reading'
  import { computeSignals } from '../lib/signals'
  import { indian, pct, shortDate } from '../lib/format'

  let hist = $state<History | null>(null)
  onMount(async () => { hist = await fetchHistory(rate.config.chartDefaultRange as '1m') })

  const k = $derived(settings.data.karat)
  const scale = $derived(rate.purity(k) * rate.cityFactor)
  const pts = $derived((hist?.points ?? []).map((p) => ({ t: p.t, v: p.v * scale })))
  const cur = $derived(rate.perGram(k))
  const reading = $derived(readingFor(hist && { points: pts, high: hist.high && hist.high * scale, low: hist.low && hist.low * scale }, cur))
  const s = $derived(computeSignals({ points: pts, current: cur, todayPct: rate.change(k)?.pct ?? null }))
  const today = $derived(rate.change(k))
  const caption = { low: 'Low compared with recent weeks', high: 'High compared with recent weeks', mid: 'Close to its usual level', none: 'Not enough history yet' }
  const dot = $derived(reading.key === 'low' ? 0 : reading.key === 'high' ? 2 : 1)
  const rangeText = $derived(!s ? '' : s.rangePos <= 0.05 ? "At the very bottom of this month's range." : s.rangePos >= 0.95 ? "At the very top of this month's range." : `${Math.round(s.rangePos * 100)}% of the way up this month's range.`)
</script>

<Main />
<Sheet label="Why this reading" top={150}>
  <p class="label top">Today's reading</p>
  <h1 class="serif">{reading.line}</h1>
  <div class="meter" aria-hidden="true">
    <span class="dots">{#each [0, 1, 2] as i}<i class:on={i === dot}></i>{/each}</span>
    <span class="cap">{caption[reading.key]}</span>
  </div>

  {#if s}
    <div class="sig rise"><div class="h"><span class="label">Trend</span></div>
      <p>{s.vsAverage === 'near' ? 'Close to' : s.vsAverage === 'below' ? 'Below' : 'Above'} its month average of <span class="mono ink">₹{indian(Math.round(s.average))}</span>.</p></div>
    <div class="sig rise" style="--d:.07s"><div class="h"><span class="label">Momentum</span><span class="mono ink">{s.momentumPct < 0 ? '−' : '+'}{pct(s.momentumPct, 1)}</span></div>
      <p>{#if today}{today.abs < 0 ? 'Down' : 'Up'} {pct(today.pct, 1)} today and {pct(s.momentumPct, 1)} {s.momentumPct < 0 ? 'lower' : 'higher'} than on {shortDate(s.momentumSince)}.{:else}{pct(s.momentumPct, 1)} {s.momentumPct < 0 ? 'lower' : 'higher'} than on {shortDate(s.momentumSince)}.{/if}</p></div>
    <div class="sig rise" style="--d:.14s"><div class="h"><span class="label">Range</span></div><p>{rangeText}</p></div>
    <div class="sig rise" style="--d:.21s"><div class="h"><span class="label">Swings</span>
      <span class="bars" aria-hidden="true">{#each [1, 2, 3, 4, 5] as b}<i class:on={b <= s.swingLevel} style="height:{4 + b * 3}px"></i>{/each}</span></div>
      <p>{s.swings === 'bigger' ? 'Bigger daily moves than usual. Buying in parts softens a bad day.' : s.swings === 'smaller' ? 'Calmer daily moves than usual.' : 'Daily moves are about usual.'}</p></div>
  {:else}
    <p class="none">Ibriz needs a few days of saved prices before it can explain a reading.</p>
  {/if}
  <p class="foot">For learning, not advice. Based only on Ibriz's own saved prices. <a href={href('guide', 'how-the-reading-works')} class="how">How this works</a></p>
</Sheet>

<style>
  .top { margin-top: 18px; }
  h1 { margin-top: 8px; font-size: 26px; line-height: 1.2; letter-spacing: -0.01em; text-wrap: balance; }
  .meter { display: flex; align-items: center; gap: 12px; margin: 16px 0 6px; }
  .dots { display: flex; gap: 8px; }
  .dots i { width: 6px; height: 6px; border: 1px solid var(--ink-3); transform: rotate(45deg); }
  .dots i.on { background: var(--gold); border-color: var(--gold); }
  .cap { font-size: 13px; color: var(--ink-2); }
  .sig { padding: 14px 0; border-bottom: 1px solid var(--line-soft); }
  .h { display: flex; justify-content: space-between; align-items: center; }
  .sig p { margin-top: 6px; font-size: 14px; line-height: 1.5; color: var(--ink-2); }
  .ink { color: var(--ink); }
  .bars { display: flex; align-items: flex-end; gap: 3px; height: 18px; }
  .bars i { width: 4px; background: var(--line); }
  .bars i.on { background: var(--gold); }
  .none, .foot { margin-top: 16px; font-size: 12px; line-height: 1.5; color: var(--ink-3); }
  .none { font-size: 14px; color: var(--ink-2); }
.how { color: var(--gold-text); text-decoration: underline; text-underline-offset: 3px; white-space: nowrap; }
</style>
