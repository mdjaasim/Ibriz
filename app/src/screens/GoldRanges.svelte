<script lang="ts">
  import { onMount } from 'svelte'
  import Screen from '../components/Screen.svelte'
  import BackBar from '../components/BackBar.svelte'
  import CompareTabs from '../components/CompareTabs.svelte'
  import HeroNumber from '../components/HeroNumber.svelte'
  import { holdings } from '../lib/holdings.svelte'
  import { rate } from '../lib/rate.svelte'
  import { fetchHistory, type History } from '../lib/history'
  import { portfolioStats } from '../lib/portfolio'
  import { gainColor, lakh } from '../lib/mygold-bits'
  import { indian, shortDate } from '../lib/format'

  let hist = $state<History | null>(null)
  onMount(async () => { hist = await fetchHistory('1m') })

  const pieces = $derived(holdings.pieces)
  const st = $derived(portfolioStats(pieces, (k) => rate.perGram(k), (k) => rate.purity(k)))
  // Value of everything if the 24K rate were `r24` (karats scale with their purity).
  const valueAt = (r24: number) => pieces.reduce((s, p) => s + p.netG * r24 * rate.purity(p.karat), 0) * rate.cityFactor
  const enough = $derived((hist?.points.length ?? 0) >= 3)
  const maxPt = $derived(enough && hist ?  hist.points.reduce((a, b) => (b.v > a.v ? b : a)) : null)
  const hiV = $derived(maxPt ? valueAt(maxPt.v) : null)
  const avgV = $derived(enough && hist?.average != null ? valueAt(hist.average) : null)
  const loV = $derived(enough && hist?.low != null ? valueAt(hist.low) : null)
  const paid = $derived(st.paid)
  const vals = $derived([paid, hiV, avgV, loV, st.worth].filter((v): v is number => v !== null))
  const lo = $derived(vals.length ? Math.min(...vals) * 0.95 : 0)
  const hi = $derived(vals.length ? Math.max(...vals) * 1.03 : 1)
  const pos = (v: number) => ((v - lo) / (hi - lo)) * 100
  const atLow = $derived(loV !== null && st.worth <= loV * 1.0005)
  const pcOnCost = (v: number) => (paid ? ((v - paid) / paid) * 100 : null)
  const fmt = (n: number | null) => (n === null ? '' : (n < 0 ? '−' : '+') + Math.abs(n).toFixed(1) + '% on cost')
  const oneKarat = $derived(new Set(pieces.map((p) => p.karat)).size === 1 ? pieces[0].karat : null)
  const r24Label = (r24: number) => (oneKarat ? oneKarat + 'K at ₹' + indian(Math.round(r24 * rate.purity(oneKarat) * rate.cityFactor)) : '24K at ₹' + indian(Math.round(r24 * rate.cityFactor)))
  const rows = $derived(
    enough && hist && hist.average != null && maxPt && hist.low != null
      ? [
          { name: 'Month high', note: r24Label(maxPt.v) + ' · ' + shortDate(maxPt.t), v: hiV! },
          { name: 'Month average', note: r24Label(hist.average), v: avgV! },
          { name: 'Today', note: r24Label(rate.rate24 / rate.cityFactor) + (atLow ? ' · the low' : ''), v: st.worth },
        ]
      : []
  )
</script>

<Screen>
  <BackBar title="Your gold" to="mygold" />
  <CompareTabs active="goldranges" />

  {#if !pieces.length}
    <p class="none">Add a piece to see its range.</p>
  {:else}
    <div class="rise intro" style="--d:.1s">
      <p class="label">{+st.grams.toFixed(2)} g · this month</p>
      <div class="big"><span class="rs">₹</span><HeroNumber value={st.worth} size={54} /></div>
      {#if hiV !== null}
        <p class="sub">{atLow ? 'Today, at the month\'s low.' : 'Today.'} <span class="mono">₹{indian(Math.round(hiV - st.worth))}</span> below its high.</p>
      {/if}
    </div>

    {#if hiV !== null && loV !== null}
      <div class="rise scale" style="--d:.2s" aria-label="Scale from {lakh(lo)} to {lakh(hi)}: what you paid, then this month's range from low to high">
        <div class="track">
          <i class="band" style="left:{pos(loV)}%;width:{pos(hiV) - pos(loV)}%"></i>
          {#if paid !== null}<i class="mark paid" style="left:{pos(paid)}%"></i>{/if}
          <i class="mark now" style="left:{pos(st.worth)}%"></i>
        </div>
        <div class="labels">
          {#if paid !== null}<span style="left:{pos(paid)}%">You paid</span>{/if}
          <span style="left:{pos(st.worth)}%;top:16px">Today</span>
          <span style="left:{pos(hiV)}%">High</span>
        </div>
        <div class="ends mono"><span>{lakh(lo)}</span><span>{lakh(hi)}</span></div>
      </div>
    {/if}

    <div class="list">
      {#each rows as r, i}
        <div class="row rise" style="--d:{0.25 + i * 0.05}s">
          <span class="nm"><span>{r.name}</span><span class="meta">{r.note}</span></span>
          <span class="rt"><span class="mono">₹{indian(Math.round(r.v))}</span><span class="mono pc" style="color:{gainColor(pcOnCost(r.v))}">{fmt(pcOnCost(r.v))}</span></span>
        </div>
      {/each}
    </div>
    {#if !rows.length}<p class="none">Month figures appear once the rate history has built up.</p>{/if}
    {#if paid !== null}<p class="rise note" style="--d:.45s">You paid <span class="mono">₹{indian(Math.round(paid))}</span> in all, making charges and GST included.</p>{/if}
  {/if}
</Screen>

<style>
  .intro { margin-top: 22px; }
  .big { display: flex; align-items: flex-start; height: 60px; margin-top: 6px; }
  .rs { font-size: 22px; font-weight: 300; color: var(--gold-text); margin: 8px 5px 0 0; }
  .sub { margin-top: 8px; font-size: 14px; color: var(--ink-2); }
  .scale { margin-top: 28px; }
  .track { position: relative; height: 20px; }
  .track::before { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: var(--line); }
  .band { position: absolute; top: 50%; height: 8px; transform: translateY(-50%); background: color-mix(in srgb, var(--gold) 28%, transparent); border-radius: 4px; }
  .mark { position: absolute; top: 50%; width: 9px; height: 9px; transform: translate(-50%, -50%) rotate(45deg); }
  .mark.paid { border: 1px solid var(--ink-2); background: var(--ground); }
  .mark.now { background: var(--gold); }
  .labels { position: relative; height: 34px; font-size: 11px; color: var(--ink-3); }
  .labels span { position: absolute; transform: translateX(-50%); top: 6px; white-space: nowrap; }
  .ends { display: flex; justify-content: space-between; font-size: 11px; color: var(--ink-3); }
  .list { margin-top: 20px; }
  .nm { display: flex; flex-direction: column; gap: 3px; }
  .meta { font-size: 12px; color: var(--ink-3); }
  .rt { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
  .rt .mono { font-size: 15px; }
  .pc { font-size: 12px !important; }
  .row { min-height: 58px; }
  .note { margin-top: 14px; font-size: 14px; color: var(--ink-2); line-height: 1.5; }
  .note .mono { color: var(--ink); }
  .none { margin-top: 28px; font-size: 14px; color: var(--ink-2); }
</style>
