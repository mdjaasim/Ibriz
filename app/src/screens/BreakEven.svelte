<script lang="ts">
  import Screen from '../components/Screen.svelte'
  import LearnHeader from '../components/LearnHeader.svelte'
  import GuideLink from '../components/GuideLink.svelte'
  import PlannerTabs from '../components/PlannerTabs.svelte'
  import BigInput from '../components/BigInput.svelte'
  import CalcSlider from '../components/CalcSlider.svelte'
  import CalcLadder from '../components/CalcLadder.svelte'
  import Chip from '../components/Chip.svelte'
  import { rate } from '../lib/rate.svelte'
  import { settings } from '../lib/settings.svelte'
  import { holdings } from '../lib/holdings.svelte'
  import { href } from '../lib/router.svelte'
  import { parseNumber } from '../lib/calc'
  import { calcLimits } from '../lib/calcconfig'
  import { breakEven } from '../lib/planner'
  import { indian } from '../lib/format'

  let weightText = $state('')
  let paidText = $state('')
  let karat = $state(settings.data.karat)
  let deduction = $state(rate.config.defaultSellDeductionPct)
  let picked = $state<string | null>(null)

  const priced = $derived(holdings.pieces.filter((p) => (p.totalPaid ?? 0) > 0))
  function pick(id: string) {
    const p = holdings.pieces.find((x) => x.id === id)
    if (!p) return
    picked = id
    weightText = String(+p.netG.toFixed(3))
    paidText = String(Math.round(p.totalPaid ?? 0))
    karat = p.karat
  }

  const netG = $derived(parseNumber(weightText))
  const paid = $derived(parseNumber(paidText))
  const today = $derived(rate.perGram(karat))
  const r = $derived(breakEven({ paid, netG, deductionPct: deduction, ratePerG: today }))
  const pctText = (n: number) => String(Math.round(n * 10) / 10)
  const above = $derived(r ? r.salePct > 0 : false)
</script>

<Screen tab="learn">
  <LearnHeader title="Plan" back="menu">
    {#snippet right()}<GuideLink id="break-even" />{/snippet}
  </LearnHeader>
  <PlannerTabs active="breakeven" />

  {#if priced.length}
    <div class="rise from" style="--d:.1s">
      <p class="label">From My Gold</p>
      <div class="chips" role="radiogroup" aria-label="Pick a piece">
        {#each priced as p}<Chip on={picked === p.id} label={p.name} onclick={() => pick(p.id)} />{/each}
      </div>
    </div>
  {/if}

  <div class="rise" style="--d:.12s">
    <BigInput id="w" label="Weight" unit="grams" bind:value={weightText} hint="Net gold weight, from the bill." />
    <BigInput id="p" label="Total you paid" prefix="₹" bind:value={paidText} hint="Gold, making charges and GST together." />
  </div>
  <p class="rise calc" style="--d:.14s">Not sure? <a href={href('calculator')}>Work it out in the calculator</a>.</p>

  <div class="rise chips" style="--d:.16s" role="radiogroup" aria-label="Purity">
    {#each rate.config.karats as k}<Chip on={k === karat} label="{k}K" mono onclick={() => { karat = k; picked = null }} />{/each}
  </div>

  <div class="rise sl" style="--d:.18s">
    <div class="slh"><span class="label">Shop deduction</span><span><span class="serif big">{pctText(deduction)}</span><span class="of"> %</span></span></div>
    <CalcSlider bind:value={deduction} max={calcLimits.deductionMaxPct} step={calcLimits.stepPct} label="Shop deduction percent" />
    <p class="hint">Ask the shop what it takes off when it buys back.</p>
  </div>

  {#if r}
    <CalcLadder
      steps={[
        { label: 'You paid', value: Math.round(paid) },
        { label: 'Gold alone breaks even at, a gram', value: Math.round(r.meltRate) },
      ]}
      total={{
        label: 'After the shop deduction',
        note: `a gram of ${karat}K · today ₹${indian(Math.round(today))}`,
        value: r.saleRate,
      }}
    />
    <p class="verdict" aria-live="polite">
      {#if above}
        The rate must rise by <span class="mono">{pctText(r.salePct)}%</span> (₹{indian(Math.round(r.saleAbs))} a gram) from today.
      {:else}
        Today’s rate is already <span class="mono">{pctText(Math.abs(r.salePct))}%</span> above this level.
      {/if}
    </p>
  {:else}
    <p class="verdict">Enter the weight and what you paid.</p>
  {/if}

  <p class="note">An estimate: the deduction is yours to set and real offers vary. Making charges and GST are not returned when you sell. For learning, not advice.</p>
</Screen>

<style>
  .from { margin-top: 20px; }
  .chips { display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
  .calc { margin-top: 14px; font-size: 13px; color: var(--ink-3); }
  .calc a { color: var(--gold-text); text-decoration: underline; text-underline-offset: 3px; }
  .sl { margin-top: 24px; }
  .slh { display: flex; align-items: baseline; justify-content: space-between; }
  .big { font-size: 34px; }
  .of { font-size: 16px; color: var(--ink-2); }
  .hint { margin-top: 4px; font-size: 14px; color: var(--ink-3); }
  .verdict { margin-top: 16px; font-size: 15px; line-height: 1.5; color: var(--ink-2); }
  .verdict .mono { color: var(--ink); }
  .note { margin-top: 14px; font-size: 13px; line-height: 1.5; color: var(--ink-3); }
</style>
