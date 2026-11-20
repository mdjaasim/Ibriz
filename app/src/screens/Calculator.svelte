<script lang="ts">
  import LearnHeader from '../components/LearnHeader.svelte'
  import Screen from '../components/Screen.svelte'
  import CalcSwitch from '../components/CalcSwitch.svelte'
  import CalcSlider from '../components/CalcSlider.svelte'
  import CalcLadder from '../components/CalcLadder.svelte'
  import { rate } from '../lib/rate.svelte'
  import { settings } from '../lib/settings.svelte'
  import { href } from '../lib/router.svelte'
  import { buy, parseNumber } from '../lib/calc'
  import { calcLimits } from '../lib/calcconfig'
  import { indian } from '../lib/format'

  let weightText = $state('')
  let karat = $state(settings.data.karat)
  let makingPct = $state(rate.config.defaultMakingPct)

  const weight = $derived(parseNumber(weightText))
  const ratePerG = $derived(rate.perGram(karat))
  const r = $derived(buy({
    weightG: weight, ratePerG, makingPct,
    gstGoldPct: rate.config.gstGold * 100, gstMakingPct: rate.config.gstMaking * 100,
  }))
  const pctText = (n: number) => String(Math.round(n * 10) / 10)
  const ready = $derived(weight > 0 && ratePerG > 0)
  const prefill = $derived(`karat=${karat}&weight=${weight}&paid=${Math.round(r.total)}&making=${Math.round(r.making)}&gst=${Math.round(r.gstGold + r.gstMaking)}`)
</script>

<Screen>
  <LearnHeader title="Calculator" back="menu" />
  <CalcSwitch active="calculator" />

  <div class="rise field" style="--d:.1s">
    <label class="label" for="w">Weight</label>
    <div class="inp">
      <input id="w" class="serif" inputmode="decimal" placeholder="0" bind:value={weightText} maxlength="7" autocomplete="off" />
      <span class="unit">grams</span>
    </div>
    <p class="hint">Net gold weight, from the shop tag or bill.</p>
  </div>

  <div class="rise chips" style="--d:.14s" role="radiogroup" aria-label="Purity">
    {#each rate.config.karats as k}
      <button type="button" role="radio" aria-checked={k === karat} class="chip" class:on={k === karat} onclick={() => (karat = k)}>{k}K</button>
    {/each}
  </div>

  <div class="rise mk" style="--d:.18s">
    <div class="mkh"><span class="label">Making charges</span><span><span class="serif big">{pctText(makingPct)}</span><span class="of"> % of gold value</span></span></div>
    <CalcSlider bind:value={makingPct} max={calcLimits.makingMaxPct} step={calcLimits.stepPct} label="Making charges percent" />
  </div>

  <CalcLadder
    steps={[
      { label: `Gold · ${pctText(weight)} g at ₹${indian(Math.round(ratePerG))}`, value: Math.round(r.gold) },
      { label: `Making charges · ${pctText(makingPct)}%`, value: Math.round(r.making) },
      { label: `GST on gold · ${pctText(rate.config.gstGold * 100)}%`, value: Math.round(r.gstGold) },
      { label: `GST on making · ${pctText(rate.config.gstMaking * 100)}%`, value: Math.round(r.gstMaking) },
    ]}
    total={{ label: 'You pay', note: ready ? `₹${indian(Math.round(r.allInPerG))} a gram, all in` : 'Enter a weight', value: r.total }}
  />
  <p class="ind">Indicative: based on today’s Ibriz rate, not a shop quote.</p>

  <div class="rise foot" style="--d:.5s">
    {#if ready}
      <a class="btn secondary" href={href('addpiece', prefill)}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style="margin-right:12px"><path d="M7 1v12M1 7h12" stroke="var(--gold)" stroke-width="1.4" stroke-linecap="round"/></svg>Save to My Gold
      </a>
    {:else}
      <button type="button" class="btn secondary" disabled>Save to My Gold</button>
    {/if}
  </div>
</Screen>

<style>
  .field { margin-top: 28px; }
  .inp { display: flex; align-items: flex-end; gap: 14px; margin-top: 8px; padding-bottom: 6px; border-bottom: 1px solid var(--gold); }
  input { width: 100%; min-width: 0; background: none; border: 0; outline: 0; font-size: 56px; line-height: 1.1; padding: 0; caret-color: var(--gold); }
  input::placeholder { color: var(--ink-3); }
  .inp:has(input:focus-visible) { outline: 0; }
  .unit { font-size: 22px; color: var(--ink-2); padding-bottom: 8px; flex: none; }
  .hint { margin-top: 10px; font-size: 14px; color: var(--ink-3); }
  .chips { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
  .chip { height: 40px; padding: 0 20px; border-radius: var(--radius-chip); border: 1px solid var(--line); font-size: 16px; color: var(--ink-2); }
  .chip.on { border-color: var(--gold); background: color-mix(in srgb, var(--gold) 10%, transparent); color: var(--ink); }
  .mk { margin-top: 30px; }
  .mkh { display: flex; align-items: baseline; justify-content: space-between; }
  .big { font-size: 34px; }
  .of { font-size: 16px; color: var(--ink-2); }
  .ind { margin-top: 12px; font-size: 13px; color: var(--ink-3); }
  .foot { margin-top: 26px; }
</style>
