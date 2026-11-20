<script lang="ts">
  import Main from './Main.svelte'
  import Sheet from '../components/Sheet.svelte'
  import { rate } from '../lib/rate.svelte'
  import { settings } from '../lib/settings.svelte'
  import { router, href } from '../lib/router.svelte'

  const base = $derived((rate.latest?.premium ?? rate.config.premium) * 100)
  const premiumOf = (c: string) => base + (settings.data.cityAdjust[c] ?? 0)
  const fmt = (n: number) => (n >= 0 ? '+' : '−') + Math.abs(n).toFixed(1) + '%'
</script>

<Main />
<Sheet label="Choose city" top={230}>
  <div class="head">
    <div><p class="label">Tamil Nadu</p><h1 class="serif">Your city</h1></div>
    <button type="button" class="done" onclick={() => router.back()}>Done</button>
  </div>
  <div role="radiogroup" aria-label="City" class="list">
    <div class="cols label"><span>City</span><span>Shop premium</span></div>
    {#each rate.config.cities as c}
      <button type="button" role="radio" aria-checked={c === settings.data.city} class="row" onclick={() => settings.set('city', c)}>
        <span>{c}</span>
        <span class="r"><span class="mono">{fmt(premiumOf(c))}</span><i class:on={c === settings.data.city}></i></span>
      </button>
    {/each}
  </div>
  <p class="help">If your jeweller's board is always a little higher or lower, adjust that city's premium. <a href={href('adjustpremium')}>Adjust {settings.data.city}</a></p>
</Sheet>

<style>
  .head { display: flex; align-items: flex-end; justify-content: space-between; margin-top: 18px; }
  .head h1 { margin-top: 6px; font-size: 28px; }
  .done { height: 44px; font-size: 14px; color: var(--gold-text); }
  .list { margin-top: 12px; }
  .cols { display: flex; justify-content: space-between; height: 30px; align-items: center; }
  .row { width: 100%; text-align: left; }
  .r { display: flex; align-items: center; gap: 14px; font-size: 13px; color: var(--ink-2); }
  .r i { width: 6px; height: 6px; transform: rotate(45deg); }
  .r i.on { background: var(--gold); }
  .help { margin-top: 16px; font-size: 13px; line-height: 1.5; color: var(--ink-3); }
  .help a { color: var(--gold-text); }
</style>
