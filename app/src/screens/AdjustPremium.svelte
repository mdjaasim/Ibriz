<script lang="ts">
  import Main from './Main.svelte'
  import Sheet from '../components/Sheet.svelte'
  import { rate } from '../lib/rate.svelte'
  import { settings } from '../lib/settings.svelte'
  import { router } from '../lib/router.svelte'
  import { toast } from '../lib/toast.svelte'
  import { indian, signedRupees } from '../lib/format'

  const city = settings.data.city
  const base = $derived((rate.latest?.premium ?? rate.config.premium) * 100)
  const limit = $derived(rate.config.maxPremiumAdjustPct)
  let adj = $state(settings.data.cityAdjust[city] ?? 0)
  const karat = $derived(settings.data.karat)
  const unadjusted = $derived((rate.latest?.rate24 ?? 0) * rate.purity(karat))
  const shown = $derived(unadjusted * (1 + adj / 100))
  const dp = (n: number) => (n >= 0 ? '+' : '−') + Math.abs(n).toFixed(1)
  const baseText = $derived(base.toFixed(0))

  function save() {
    settings.set('cityAdjust', { ...settings.data.cityAdjust, [city]: adj })
    toast.show(`Saved for ${city}`)
    router.back()
  }
  function reset() { adj = 0 }
</script>

<Main />
<Sheet label="Adjust city premium" top={190}>
  <div class="head">
    <div><p class="label">{city}</p><h1 class="serif">Shop premium</h1></div>
    <button type="button" aria-label="Close" class="x" onclick={() => router.back()}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 2l10 10M12 2 2 12" stroke="var(--ink-2)" stroke-width="1.4" stroke-linecap="round"/></svg>
    </button>
  </div>
  <p class="help">Raise it if your jeweller's board is usually above Ibriz, lower it if below.</p>
  <p class="big serif">{dp(base + adj)}<span>%</span></p>

  <div class="slider">
    <input type="range" aria-label="Shop premium" min={-limit} max={limit} step="0.5" bind:value={adj} />
    <div class="ends"><span class="mono">{dp(base - limit)}%</span><span class="def">Default {baseText}%</span><span class="mono">{dp(base + limit)}%</span></div>
  </div>

  <div class="would">
    <span>{karat}K would show</span>
    <span class="r"><span class="mono">₹{indian(Math.round(shown))}</span>{#if Math.round(shown - unadjusted) !== 0}<span class="mono d">{signedRupees(Math.round(shown - unadjusted))}</span>{/if}</span>
  </div>

  <div class="acts">
    <button type="button" class="btn primary" onclick={save}>Save for {city}</button>
    <button type="button" class="reset" onclick={reset}>Reset to {baseText}%</button>
  </div>
</Sheet>

<style>
  .head { display: flex; align-items: flex-end; justify-content: space-between; margin-top: 18px; }
  .head h1 { margin-top: 6px; font-size: 28px; }
  .x { width: 44px; height: 44px; display: flex; align-items: center; justify-content: flex-end; }
  .help { margin-top: 10px; font-size: 14px; line-height: 1.5; color: var(--ink-2); }
  .big { margin-top: 26px; font-size: 58px; letter-spacing: -0.02em; text-align: center; }
  .big span { font-size: 0.45em; color: var(--gold-text); margin-left: 4px; }
  .slider { margin-top: 22px; }
  input[type='range'] { -webkit-appearance: none; appearance: none; width: 100%; height: 44px; background: transparent; margin: 0; }
  input[type='range']::-webkit-slider-runnable-track { height: 1px; background: var(--line); }
  input[type='range']::-moz-range-track { height: 1px; background: var(--line); }
  input[type='range']::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; margin-top: -7px; background: var(--gold); transform: rotate(45deg); box-shadow: 0 0 0 8px color-mix(in srgb, var(--gold) 18%, transparent); border: 0; }
  input[type='range']::-moz-range-thumb { width: 14px; height: 14px; background: var(--gold); transform: rotate(45deg); border: 0; border-radius: 0; box-shadow: 0 0 0 8px color-mix(in srgb, var(--gold) 18%, transparent); }
  .ends { display: flex; justify-content: space-between; font-size: 11px; color: var(--ink-3); }
  .def { color: var(--ink-2); }
  .would { display: flex; justify-content: space-between; align-items: center; margin-top: 22px; padding: 14px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); font-size: 14px; color: var(--ink-2); }
  .r { display: flex; gap: 10px; align-items: baseline; }
  .r .mono { color: var(--ink); font-size: 16px; }
  .d { font-size: 12px !important; color: var(--ink-2) !important; }
  .acts { margin-top: 22px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .reset { height: 44px; font-size: 14px; color: var(--ink-2); }
</style>
