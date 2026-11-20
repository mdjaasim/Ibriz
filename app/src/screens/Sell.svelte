<script lang="ts">
  import GuideLink from '../components/GuideLink.svelte'
  import LearnHeader from '../components/LearnHeader.svelte'
  import Screen from '../components/Screen.svelte'
  import CalcSwitch from '../components/CalcSwitch.svelte'
  import CalcSlider from '../components/CalcSlider.svelte'
  import CalcLadder from '../components/CalcLadder.svelte'
  import { rate } from '../lib/rate.svelte'
  import { settings } from '../lib/settings.svelte'
  import { holdings } from '../lib/holdings.svelte'
  import { sell, parseNumber } from '../lib/calc'
  import { calcLimits } from '../lib/calcconfig'
  import { indian, shortDate } from '../lib/format'

  let pickedId = $state<string | null>(null) // null = first piece, or manual entry if none
  let weightText = $state('')
  let karat = $state(settings.data.karat)
  let deductionPct = $state(rate.config.defaultSellDeductionPct)

  const piece = $derived(holdings.pieces.find((p) => p.id === (pickedId ?? holdings.pieces[0]?.id)) ?? null)
  const weight = $derived(piece ? piece.netG : parseNumber(weightText))
  const k = $derived(piece ? piece.karat : karat)
  const ratePerG = $derived(rate.perGram(k))
  const r = $derived(sell({ weightG: weight, ratePerG, deductionPct }))
  const t = (n: number) => String(Math.round(n * 10) / 10)
  const ready = $derived(weight > 0 && ratePerG > 0)
  const diff = $derived(piece?.totalPaid ? r.net - piece.totalPaid : null)
</script>

<Screen tab="learn">
  <LearnHeader title="Calculator" back="menu">
    {#snippet right()}<GuideLink id="what-you-pay" />{/snippet}
  </LearnHeader>
  <CalcSwitch active="sell" />

  {#if holdings.pieces.length}
    <div class="rise from" style="--d:.1s">
      <p class="label">From My Gold</p>
      <div class="chips" role="radiogroup" aria-label="Piece">
        {#each holdings.pieces as p}
          <button type="button" role="radio" aria-checked={p.id === piece?.id} class="chip" class:on={p.id === piece?.id} onclick={() => (pickedId = p.id)}>
            {#if p.id === piece?.id}<i aria-hidden="true"></i>{/if}{p.name}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <div class="rise field" style="--d:.14s">
    <label class="label" for="w">Weight</label>
    <div class="inp">
      {#if piece}
        <span class="serif big">{t(weight)}</span>
        <span class="unit">grams · {piece.karat}K</span>
      {:else}
        <input id="w" class="serif" inputmode="decimal" placeholder="0" bind:value={weightText} maxlength="7" autocomplete="off" />
        <span class="unit">grams</span>
      {/if}
    </div>
    <p class="hint">{piece ? 'Filled in from your piece.' : 'Net gold weight of what you want to sell.'}</p>
  </div>

  {#if !piece}
    <div class="rise chips2" style="--d:.16s" role="radiogroup" aria-label="Purity">
      {#each rate.config.karats as kk}
        <button type="button" role="radio" aria-checked={kk === karat} class="chip" class:on={kk === karat} onclick={() => (karat = kk)}>{kk}K</button>
      {/each}
    </div>
  {/if}

  <div class="rise mk" style="--d:.18s">
    <div class="mkh"><span class="label">Shop deduction</span><span><span class="serif bigp">{t(deductionPct)}</span><span class="of"> %</span></span></div>
    <CalcSlider bind:value={deductionPct} max={calcLimits.deductionMaxPct} step={calcLimits.stepPct} label="Shop deduction percent" />
    <p class="hint">Ask the shop what it takes off when it buys back.</p>
  </div>

  <CalcLadder
    steps={[
      { label: `Gold · ${t(weight)} g at ₹${indian(Math.round(ratePerG))}`, value: Math.round(r.gold) },
      { label: `Shop deduction · ${t(deductionPct)}%`, value: -Math.round(r.deduction) },
    ]}
    total={{ label: 'You may get', note: 'Making and GST are not returned', value: r.net }}
  />
  <p class="ind">An estimate from today’s indicative rate, not an offer.</p>

  {#if ready && diff !== null && piece}
    <p class="rise cmp" style="--d:.4s">
      <i aria-hidden="true"></i>
      <span>That is <span class="mono">₹{indian(Math.abs(Math.round(diff)))}</span> {diff >= 0 ? 'more' : 'less'} than you paid{piece.boughtAt ? ' in ' + shortDate(piece.boughtAt) : ''}.</span>
    </p>
  {/if}
</Screen>

<style>
  .from { margin-top: 24px; }
  .chips { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
  .chips2 { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
  .chip { height: 40px; padding: 0 18px; border-radius: var(--radius-chip); border: 1px solid var(--line); font-size: 15px; color: var(--ink-2); display: flex; align-items: center; gap: 8px; }
  .chip.on { border-color: var(--gold); background: color-mix(in srgb, var(--gold) 10%, transparent); color: var(--ink); }
  .chip i { width: 6px; height: 6px; background: var(--gold); transform: rotate(45deg); }
  .field { margin-top: 26px; }
  .inp { display: flex; align-items: flex-end; gap: 14px; margin-top: 8px; padding-bottom: 6px; border-bottom: 1px solid var(--gold); }
  input { width: 100%; min-width: 0; background: none; border: 0; outline: 0; font-size: 56px; line-height: 1.1; padding: 0; caret-color: var(--gold); }
  input::placeholder { color: var(--ink-3); }
  .big { font-size: 56px; line-height: 1.1; }
  .unit { font-size: 22px; color: var(--ink-2); padding-bottom: 8px; flex: none; }
  .hint { margin-top: 10px; font-size: 14px; color: var(--ink-3); }
  .mk { margin-top: 28px; }
  .mkh { display: flex; align-items: baseline; justify-content: space-between; }
  .bigp { font-size: 34px; }
  .of { font-size: 16px; color: var(--ink-2); }
  .ind { margin-top: 12px; font-size: 13px; color: var(--ink-3); }
  .cmp { display: flex; align-items: center; gap: 12px; margin-top: 22px; font-size: 15px; color: var(--ink-2); }
  .cmp i { width: 8px; height: 8px; background: var(--gold); transform: rotate(45deg); flex: none; }
</style>
