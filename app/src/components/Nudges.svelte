<script lang="ts">
  import { rate } from '../lib/rate.svelte'
  import { holdings } from '../lib/holdings.svelte'
  import { portfolioStats } from '../lib/portfolio'
  import { indian } from '../lib/format'
  import AlertBanner from './AlertBanner.svelte'
  // My Gold nudges, all worked out on this phone: a break-even alert that was hit, and today's rate
  // compared with your average cost. Descriptive only; nothing here says buy or sell.
  const st = $derived(portfolioStats(holdings.pieces, (k) => rate.perGram(k), (k) => rate.purity(k)))
  const karats = $derived([...new Set(holdings.pieces.map((p) => p.karat))])
  const card = $derived.by(() => {
    if (karats.length !== 1 || st.avgCostPerGram === null || !rate.latest) return null
    const today = rate.perGram(karats[0])
    const diff = ((today - st.avgCostPerGram) / st.avgCostPerGram) * 100
    if (Math.abs(diff) < rate.config.nudgeAvgCostPct) return null
    return { diff, today, avg: st.avgCostPerGram, k: karats[0] }
  })
</script>

<AlertBanner kinds={['breakeven']} />
{#if card}
  <aside class="nudge">
    <p>Today’s {card.k}K rate, <span class="mono">₹{indian(Math.round(card.today))}</span> a gram, is <span class="mono">{Math.abs(card.diff).toFixed(0)}%</span> {card.diff < 0 ? 'below' : 'above'} your average cost of <span class="mono">₹{indian(Math.round(card.avg))}</span>. What you paid includes making charges and GST.</p>
  </aside>
{/if}

<style>
  .nudge { margin-top: 16px; font-size: 14px; line-height: 1.5; color: var(--ink-2); padding-left: 14px; border-left: 1px solid var(--gold); }
  .nudge .mono { color: var(--ink); }
</style>
