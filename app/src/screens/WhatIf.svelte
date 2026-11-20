<script lang="ts">
  import Screen from '../components/Screen.svelte'
  import BackBar from '../components/BackBar.svelte'
  import CompareTabs from '../components/CompareTabs.svelte'
  import { holdings } from '../lib/holdings.svelte'
  import { rate } from '../lib/rate.svelte'
  import { pieceStats, whatIfValue } from '../lib/portfolio'
  import { gainColor } from '../lib/mygold-bits'
  import { indian } from '../lib/format'

  const pieces = $derived(holdings.pieces)
  // The slider is the rate for one karat (the one you hold most of); the others move with it.
  const base = $derived.by(() => {
    const by: Record<number, number> = {}
    for (const p of pieces) by[p.karat] = (by[p.karat] ?? 0) + p.netG
    const top = Object.entries(by).sort((a, b) => b[1] - a[1])[0]
    return top ? Number(top[0]) : rate.config.defaultKarat
  })
  const pur = (k: number) => rate.purity(k)
  const today = $derived(rate.perGram(base))
  const spread = $derived(rate.config.whatIfSpreadPct / 100)
  const min = $derived(Math.round(today * (1 - spread) / 50) * 50)
  const max = $derived(Math.round(today * (1 + spread) / 50) * 50)
  let chosen = $state<number | null>(null)
  const r = $derived(chosen ?? Math.round(today / 50) * 50)

  const val = (netG: number, k: number, rt: number) => whatIfValue(netG, k, rt, base, pur)
  const total = $derived(pieces.reduce((s, p) => s + val(p.netG, p.karat, r), 0))
  const nowTotal = $derived(pieces.reduce((s, p) => s + val(p.netG, p.karat, today), 0))
  const paid = $derived(pieces.every((p) => p.totalPaid) && pieces.length ? pieces.reduce((s, p) => s + p.totalPaid!, 0) : null)
  // Break-even and average cost, expressed as a rate for the base karat so they sit on the same slider.
  const baseEq = (netG: number, k: number) => netG * (pur(k) / pur(base))
  const avgCost = $derived(paid !== null ? paid / pieces.reduce((s, p) => s + baseEq(p.netG, p.karat), 0) : null)
  const stats = $derived(pieces.map((p) => ({ p, s: pieceStats(p, rate.perGram(p.karat), 0) })))
  const worst = $derived(stats.filter((x) => x.s.breakEvenRate !== null && x.s.gain! < 0).sort((a, b) => a.s.gain! - b.s.gain!)[0])
  const worstEq = $derived(worst ? worst.s.breakEvenRate! * (pur(base) / pur(worst.p.karat)) : null)
  const pos = (v: number) => Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100))
  const grams = $derived(pieces.reduce((s, p) => s + p.netG, 0))
  const sg = (n: number) => (n < 0 ? '−' : '+')
</script>

<Screen tab="mygold">
  <BackBar title="Your gold" to="mygold" />
  <CompareTabs active="whatif" />

  {#if !pieces.length}
    <p class="none">Add a piece to explore.</p>
  {:else}
    <div class="rise top" style="--d:.1s">
      <p>If {base}K is</p>
      <p class="serif big"><span class="rs">₹</span>{indian(r)}<span class="unit">a gram</span></p>
    </div>

    <div class="rise sl" style="--d:.15s">
      <input type="range" {min} {max} step="50" value={r} oninput={(e) => (chosen = Number((e.currentTarget as HTMLInputElement).value))} aria-label="{base}K rate to explore" aria-valuetext="₹{indian(r)} a gram" />
      <div class="marks">
        {#if avgCost !== null}<span style="--p:{pos(avgCost)}"><span>Your avg cost</span><span class="mono">₹{indian(Math.round(avgCost))}</span></span>{/if}
        <span style="--p:{pos(today)};top:30px"><span>Today</span><span class="mono">₹{indian(Math.round(today))}</span></span>
        {#if worst && worstEq !== null}<span style="--p:{pos(worstEq)}"><span>{worst.p.name} breaks even</span><span class="mono">₹{indian(Math.round(worstEq))}</span></span>{/if}
      </div>
    </div>

    <div class="rise res" style="--d:.2s">
      <p>Your {+grams.toFixed(2)} g would be worth</p>
      <p class="serif big2"><span class="rs2">₹</span>{indian(Math.round(total))}</p>
      <p class="d">
        <span><span class="mono" style="color:{gainColor(total - nowTotal)}">{sg(total - nowTotal)}₹{indian(Math.abs(Math.round(total - nowTotal)))}</span> vs today</span>
        {#if paid}<span><span class="mono" style="color:{gainColor(total - paid)}">{sg(total - paid)}{Math.abs(((total - paid) / paid) * 100).toFixed(1)}%</span> on cost</span>{/if}
      </p>
    </div>

    <div class="rise list" style="--d:.25s">
      {#each pieces as p}
        {@const v = val(p.netG, p.karat, r)}
        <div class="row"><span>{p.name}</span><span class="rt"><span class="mono">₹{indian(Math.round(v))}</span>
          {#if p.totalPaid}<span class="mono g" style="color:{gainColor(v - p.totalPaid)}">{sg(v - p.totalPaid)}₹{indian(Math.abs(Math.round(v - p.totalPaid)))}</span>{/if}</span></div>
      {/each}
    </div>
    <p class="rise note" style="--d:.3s">Drag to explore. This is arithmetic, not a forecast.</p>
  {/if}
</Screen>

<style>
  .top { margin-top: 22px; font-size: 14px; color: var(--ink-2); }
  .big { font-size: 56px; line-height: 1.1; letter-spacing: -0.02em; color: var(--ink); margin-top: 6px; }
  .rs { font-size: 22px; font-weight: 300; color: var(--gold-text); vertical-align: 1.1em; margin-right: 5px; font-family: var(--font-text); }
  .unit { font-family: var(--font-text); font-size: 14px; color: var(--ink-3); margin-left: 10px; letter-spacing: 0; }
  .sl { margin-top: 24px; }
  input[type=range] { -webkit-appearance: none; appearance: none; width: 100%; height: 44px; background: transparent; margin: 0; }
  input[type=range]::-webkit-slider-runnable-track { height: 1px; background: var(--gold); }
  input[type=range]::-moz-range-track { height: 1px; background: var(--gold); }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; margin-top: -7px; background: var(--gold); transform: rotate(45deg); box-shadow: 0 0 0 8px color-mix(in srgb, var(--gold) 16%, transparent); border: 0; }
  input[type=range]::-moz-range-thumb { width: 14px; height: 14px; background: var(--gold); border: 0; border-radius: 0; transform: rotate(45deg); box-shadow: 0 0 0 8px color-mix(in srgb, var(--gold) 16%, transparent); }
  .marks { position: relative; height: 80px; margin: 0 7px; }
  .marks > span { position: absolute; left: calc(var(--p) * 1%); transform: translateX(calc(var(--p) * -1%)); display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 11px; color: var(--ink-3); white-space: nowrap; top: 0; }
  .marks .mono { color: var(--ink-2); font-size: 12px; }
  .res { margin-top: 14px; font-size: 14px; color: var(--ink-2); }
  .big2 { font-size: 48px; letter-spacing: -0.02em; color: var(--ink); margin-top: 6px; }
  .rs2 { font-family: var(--font-text); font-weight: 300; font-size: 20px; color: var(--gold-text); vertical-align: 1em; margin-right: 4px; }
  .d { display: flex; gap: 18px; margin-top: 8px; font-size: 13px; }
  .list { margin-top: 18px; }
  .rt { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  .g { font-size: 12px; }
  .note { margin-top: 14px; font-size: 13px; color: var(--ink-3); }
  .none { margin-top: 28px; font-size: 14px; color: var(--ink-2); }
</style>
