<script lang="ts">
  import Screen from '../components/Screen.svelte'
  import BackBar from '../components/BackBar.svelte'
  import CompareTabs from '../components/CompareTabs.svelte'
  import { holdings } from '../lib/holdings.svelte'
  import { rate } from '../lib/rate.svelte'
  import { pieceStats } from '../lib/portfolio'
  import { gainColor, monthYear } from '../lib/mygold-bits'
  import { indian } from '../lib/format'

  const rows = $derived(
    holdings.pieces
      .map((p) => ({ p, s: pieceStats(p, rate.perGram(p.karat), rate.config.defaultSellDeductionPct), today: rate.perGram(p.karat) }))
      .filter((r) => r.s.paidPerGram !== null)
  )
  const skipped = $derived(holdings.pieces.length - rows.length)
  const karats = $derived([...new Set(rows.map((r) => r.p.karat))])
  const all = $derived(rows.flatMap((r) => [r.s.paidPerGram!, r.today]))
  const lo = $derived(Math.min(...all) * 0.9)
  const hi = $derived(Math.max(...all) * 1.05)
  const pos = (v: number) => ((v - lo) / (hi - lo)) * 100
  const grams = $derived(rows.reduce((a, r) => a + r.p.netG, 0))
  const paid = $derived(rows.reduce((a, r) => a + r.s.paid!, 0))
  const worth = $derived(rows.reduce((a, r) => a + r.s.melt, 0))
  const avgGainPerG = $derived(grams ? (worth - paid) / grams : 0)
  const ahead = $derived(rows.filter((r) => r.s.gain! >= 0).length)
  const worst = $derived([...rows].sort((a, b) => a.s.gain! - b.s.gain!)[0])
  const sgn = (n: number) => (n < 0 ? '−' : '+')
  const cur = (n: number) => '₹' + indian(Math.abs(Math.round(n)))
</script>

<Screen tab="mygold">
  <BackBar title="Your gold" to="mygold" />
  <CompareTabs active="comparebuys" />
  <div class="rise intro" style="--d:.1s">
    <h2 class="serif">Bought vs today</h2>
    <p>What you paid per gram, all in, against today's {karats.length === 1 ? karats[0] + 'K' : 'rate for each purity'}.</p>
  </div>

  {#if !rows.length}
    <p class="none">Add what you paid to a piece (Details) and it shows here.</p>
  {:else}
    <div class="chart">
      {#if karats.length === 1}
        <div class="today fade" style="left:{pos(rows[0].today)}%"><span class="mono">Today {cur(rows[0].today)}</span><i></i></div>
      {/if}
      {#each rows as r, i}
        {@const a = pos(r.s.paidPerGram!)} {@const b = pos(r.today)}
        <div class="item rise" style="--d:{0.15 + i * 0.06}s">
          <div class="l1"><span>{r.p.name}</span><span class="mono" style="color:{gainColor(r.today - r.s.paidPerGram!)}">{sgn(r.today - r.s.paidPerGram!)}{cur(r.today - r.s.paidPerGram!)}/g</span></div>
          <div class="l2">{r.p.boughtAt ? monthYear(r.p.boughtAt) + ' · ' : ''}paid <span class="mono">{cur(r.s.paidPerGram!)}</span>/g{karats.length > 1 ? ' · ' + r.p.karat + 'K' : ''}</div>
          <div class="db" aria-hidden="true">
            <i class="line" style="left:{Math.min(a, b)}%;width:{Math.abs(b - a)}%;background:{gainColor(r.today - r.s.paidPerGram!)}"></i>
            <i class="dot paid" style="left:{a}%"></i>
            <i class="dot now" style="left:{b}%"></i>
          </div>
        </div>
      {/each}
      <div class="scale mono fade" aria-hidden="true"><span>₹{indian(Math.round(lo / 100) * 100)}</span><span>₹{indian(Math.round(hi / 100) * 100)}</span></div>
    </div>

    <div class="rise sum" style="--d:.4s">
      <div class="row"><span>All {+grams.toFixed(2)} g, on average</span><span class="mono" style="color:{gainColor(avgGainPerG)}">{sgn(avgGainPerG)}{cur(avgGainPerG)}/g</span></div>
      <div class="row"><span>Paid <span class="mono">{cur(paid / grams)}</span>/g</span><span class="ink3">{sgn(worth - paid)}{Math.abs(((worth - paid) / paid) * 100).toFixed(1)}% on cost</span></div>
    </div>
    <p class="rise note" style="--d:.45s">
      {ahead === rows.length ? 'All' : ahead + ' of ' + rows.length} piece{rows.length === 1 ? ' is' : 's are'} ahead.
      {#if worst.s.gain! < 0} The {worst.p.name.toLowerCase()} needs {worst.p.karat}K at <span class="mono">{cur(worst.s.breakEvenRate!)}</span> to break even.{/if}
    </p>
    {#if skipped}<p class="note">{skipped} piece{skipped === 1 ? ' has' : 's have'} no price paid, so {skipped === 1 ? 'it is' : 'they are'} left out.</p>{/if}
  {/if}
</Screen>

<style>
  .intro { margin-top: 22px; }
  h2 { font-size: 30px; letter-spacing: -0.01em; }
  .intro p { margin-top: 8px; font-size: 14px; color: var(--ink-2); line-height: 1.5; }
  .chart { position: relative; margin-top: 22px; padding-top: 22px; }
  .today { position: absolute; top: 0; bottom: 26px; display: flex; flex-direction: column; align-items: center; transform: translateX(-50%); font-size: 11px; color: var(--gold-text); white-space: nowrap; }
  .today i { flex: 1; width: 1px; background: var(--gold); opacity: .6; }
  .item { padding: 12px 0; }
  .l1 { display: flex; justify-content: space-between; font-size: 15px; }
  .l1 .mono { font-size: 14px; }
  .l2 { font-size: 12px; color: var(--ink-3); margin-top: 3px; }
  .db { position: relative; height: 14px; margin-top: 10px; }
  .db i { position: absolute; top: 50%; }
  .line { height: 1px; opacity: .7; }
  .dot { width: 9px; height: 9px; border-radius: 50%; transform: translate(-50%, -50%); }
  .dot.paid { border: 1px solid var(--ink-2); background: var(--ground); }
  .dot.now { background: var(--gold); }
  .scale { display: flex; justify-content: space-between; font-size: 11px; color: var(--ink-3); margin-top: 4px; }
  .sum { margin-top: 18px; }
  .ink3 { color: var(--ink-3); font-size: 13px; }
  .note { margin-top: 14px; font-size: 14px; line-height: 1.5; color: var(--ink-2); }
  .note .mono { color: var(--ink); }
  .none { margin-top: 28px; font-size: 14px; color: var(--ink-2); }
</style>
