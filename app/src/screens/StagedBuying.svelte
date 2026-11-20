<script lang="ts">
  import Screen from '../components/Screen.svelte'
  import LearnHeader from '../components/LearnHeader.svelte'
  import GuideLink from '../components/GuideLink.svelte'
  import PlannerTabs from '../components/PlannerTabs.svelte'
  import BigInput from '../components/BigInput.svelte'
  import CalcSlider from '../components/CalcSlider.svelte'
  import Chip from '../components/Chip.svelte'
  import Money from '../components/Money.svelte'
  import { rate } from '../lib/rate.svelte'
  import { settings } from '../lib/settings.svelte'
  import { buy, parseNumber } from '../lib/calc'
  import { calcLimits } from '../lib/calcconfig'
  import { plannerLimits as L } from '../lib/plannerconfig'
  import { stagedPlan, stagedAtFactor } from '../lib/planner'
  import { indian, shortDate } from '../lib/format'

  let budgetText = $state('')
  let karat = $state(settings.data.karat)
  let intervalId = $state<string>('month')
  let periods = $state<number>(L.periodsDefault)
  let makingPct = $state(0)

  const budget = $derived(Math.min(parseNumber(budgetText), L.budgetMax))
  const interval = $derived(L.intervals.find((i) => i.id === intervalId) ?? L.intervals[1])
  const ratePerG = $derived(rate.perGram(karat))
  const allIn = $derived(buy({
    weightG: 1, ratePerG, makingPct,
    gstGoldPct: rate.config.gstGold * 100, gstMakingPct: rate.config.gstMaking * 100,
  }).allInPerG)
  const input = $derived({ budget, periods, allInPerG: allIn })
  const plan = $derived(stagedPlan(input))
  const ready = $derived(budget > 0 && allIn > 0)
  const lowF = $derived(1 - L.scenarioPct / 100)
  const highF = $derived(1 + L.scenarioPct / 100)
  const g = (n: number) => (Math.round(n * 100) / 100).toString()
  const pctText = (n: number) => String(Math.round(n * 10) / 10)
  const dates = $derived(Array.from({ length: Math.min(periods, 6) }, (_, i) => new Date(Date.now() + i * interval.days * 86400000)))
</script>

<Screen tab="learn">
  <LearnHeader title="Plan" back="menu">
    {#snippet right()}<GuideLink id="staged-buying" />{/snippet}
  </LearnHeader>
  <PlannerTabs active="stagedbuying" />

  <div class="rise" style="--d:.1s">
    <BigInput id="budget" label="Budget in total" prefix="₹" bind:value={budgetText} hint="What you want to spend over all the purchases." />
  </div>

  <div class="rise chips" style="--d:.14s" role="radiogroup" aria-label="Purity">
    {#each rate.config.karats as k}<Chip on={k === karat} label="{k}K" mono onclick={() => (karat = k)} />{/each}
  </div>
  <div class="rise chips" style="--d:.16s" role="radiogroup" aria-label="How often">
    {#each L.intervals as i}<Chip on={i.id === intervalId} label={i.label} onclick={() => (intervalId = i.id)} />{/each}
  </div>

  <div class="rise sl" style="--d:.18s">
    <div class="slh"><span class="label">Purchases</span><span><span class="serif big">{periods}</span><span class="of"> {interval.unit}s</span></span></div>
    <CalcSlider bind:value={periods} min={L.periodsMin} max={L.periodsMax} step={1} label="Number of purchases" />
  </div>
  <div class="rise sl" style="--d:.2s">
    <div class="slh"><span class="label">Making charges or premium</span><span><span class="serif big">{pctText(makingPct)}</span><span class="of"> % of gold value</span></span></div>
    <CalcSlider bind:value={makingPct} max={calcLimits.makingMaxPct} step={calcLimits.stepPct} label="Making charges percent" />
  </div>

  <section class="rise res" style="--d:.22s" aria-label="Result" aria-live="polite">
    <p class="label">{ready ? 'In total you would get about' : 'Enter a budget'}</p>
    <p class="hero serif">{ready ? g(plan.totalGrams) : '0'}<span class="u"> g</span></p>
    {#if ready}
      <ul>
        <li><span>Each purchase</span><Money value={Math.round(plan.perPeriod)} size={16} /></li>
        <li><span>Buys about</span><span class="mono">{g(plan.gramsPerPeriod)} g</span></li>
        <li><span>At all in</span><span class="mono">₹{indian(Math.round(allIn))} a gram</span></li>
      </ul>

      <h2 class="label sub">The same budget at another price</h2>
      <ul>
        <li><span>{pctText(L.scenarioPct)}% lower</span><span class="mono">{g(stagedAtFactor(input, lowF))} g</span></li>
        <li><span>Today</span><span class="mono">{g(plan.totalGrams)} g</span></li>
        <li><span>{pctText(L.scenarioPct)}% higher</span><span class="mono">{g(stagedAtFactor(input, highF))} g</span></li>
      </ul>

      <h2 class="label sub">When</h2>
      <ul>
        {#each dates as d, i}
          <li><span>{i === 0 ? 'Today' : shortDate(d.getTime())}</span><Money value={Math.round(plan.perPeriod)} size={15} /></li>
        {/each}
        {#if periods > dates.length}<li class="more"><span>and {periods - dates.length} more</span><span></span></li>{/if}
      </ul>
    {/if}
  </section>

  <p class="note">Arithmetic at today’s {karat}K price, not a forecast. Buying in steps does not promise a lower average price. Making charges and {pctText(rate.config.gstGold * 100)}% GST on gold are included in the all in price. For learning, not advice.</p>
</Screen>

<style>
  .chips { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
  .sl { margin-top: 24px; }
  .slh { display: flex; align-items: baseline; justify-content: space-between; }
  .big { font-size: 34px; }
  .of { font-size: 16px; color: var(--ink-2); }
  .res { margin-top: 28px; }
  .hero { font-size: 64px; line-height: 1.05; letter-spacing: -0.02em; margin-top: 4px; }
  .u { font-size: 26px; color: var(--ink-2); }
  ul { margin-top: 10px; }
  li { display: flex; align-items: center; justify-content: space-between; min-height: 44px; border-top: 1px solid var(--line); font-size: 15px; color: var(--ink-2); }
  li:last-child { border-bottom: 1px solid var(--line); }
  li .mono { color: var(--ink); font-size: 15px; }
  .more { color: var(--ink-3); font-size: 14px; }
  .sub { margin-top: 24px; }
  .note { margin-top: 18px; font-size: 13px; line-height: 1.5; color: var(--ink-3); }
</style>
