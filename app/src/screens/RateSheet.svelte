<script lang="ts">
  import Main from './Main.svelte'
  import Sheet from '../components/Sheet.svelte'
  import RateLadder from '../components/RateLadder.svelte'
  import { rate } from '../lib/rate.svelte'
  import { settings } from '../lib/settings.svelte'
  import { router, href } from '../lib/router.svelte'
  import { dayLabel, indian, signedRupees } from '../lib/format'
  import { pctText } from '../content/guides'

  type Unit = 'gram' | 'sov' | 'ten'
  let unit = $state<Unit>('gram')
  const units: { id: Unit; label: string }[] = $derived([
    { id: 'gram', label: 'Per gram' },
    { id: 'sov', label: `Sovereign · ${rate.config.gramsPerSovereign} g` },
    { id: 'ten', label: '10 g' },
  ])
  const mult = $derived(unit === 'gram' ? 1 : unit === 'sov' ? rate.config.gramsPerSovereign : 10)
  const karat = $derived(settings.data.karat)
  const l = $derived(rate.latest)
  const cityMoved = $derived(rate.cityFactor !== 1)
  const r = (n: number) => '₹' + indian(Math.round(n))
</script>

<Main />
<Sheet label="Today's rate in detail">
  <div class="head">
    <div>
      <p class="label">Tamil Nadu · {l ? dayLabel(l.updatedAt) : ''}</p>
      <h1 class="serif">Today's rate</h1>
    </div>
    <button type="button" class="done" onclick={() => router.back()}>Done</button>
  </div>

  <div role="tablist" aria-label="Unit" class="units">
    {#each units as u}
      <button type="button" role="tab" aria-selected={unit === u.id} class:on={unit === u.id} onclick={() => (unit = u.id)}>{u.label}<i></i></button>
    {/each}
  </div>

  <div role="table" aria-label="Rate by purity" class="tbl">
    <div role="row" class="row head3 label"><span role="columnheader">Purity</span><span role="columnheader" class="r">Rate</span><span role="columnheader" class="r">Since yesterday</span></div>
    {#each rate.config.karats as k}
      {@const c = rate.change(k)}
      <div role="row" class="row cols">
        <span role="cell" class="mono k" class:sel={k === karat}>{k}K{#if k === karat}<i></i>{/if}</span>
        <span role="cell" class="mono r val">{r(rate.perGram(k) * mult)}</span>
        <span role="cell" class="mono r chg" style="color:var(--{c && c.abs < 0 ? 'down' : 'up'})">{c ? signedRupees(Math.round(c.abs * mult)) : '–'}</span>
      </div>
    {/each}
  </div>

  {#if l}
    <div class="bh">
      <h2 class="serif">How it's built</h2>
      <a href={href('lesson', 'how-rate-built')}>The full guide</a>
    </div>
    <RateLadder
      steps={[
        { label: 'World gold price', value: '$' + indian(l.xauUsd, 2), unit: '/oz' },
        { label: 'In rupees, per gram', value: r(l.spotInrPerGram) },
        { label: 'Import duty', note: '+' + pctText(l.duty), value: r(l.spotInrPerGram * (1 + l.duty)) },
        { label: 'Tamil Nadu premium', note: '+' + pctText(l.premium, 1), value: r(l.rate24) },
        ...(cityMoved ? [{ label: settings.data.city + ' adjustment', note: (rate.cityFactor > 1 ? '+' : '−') + Math.abs((rate.cityFactor - 1) * 100).toFixed(1) + '%', value: r(rate.rate24) }] : []),
      ]}
      total={{ label: `${karat}K, at ${(rate.purity(karat) * 100).toFixed(1)}% gold`, value: r(rate.perGram(karat)) }}
    />
    <p class="note">Indicative, not a shop quote: shops add making charges and {pctText(rate.config.gstGold)} GST. Gold price via gold-api.com.</p>
  {/if}
</Sheet>

<style>
  .head { display: flex; align-items: flex-end; justify-content: space-between; margin-top: 18px; }
  .head h1 { margin-top: 6px; font-size: 30px; letter-spacing: -0.01em; }
  .done { height: 44px; font-size: 14px; color: var(--gold-text); }
  .units { display: flex; gap: 4px; margin: 14px 0 0 -12px; }
  .units button { height: 44px; padding: 0 12px; font-size: 14px; color: var(--ink-3); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; }
  .units button.on { color: var(--ink); }
  .units i { width: 100%; height: 1px; }
  .units .on i { background: var(--gold); }
  .tbl { margin-top: 12px; }
  .row.head3 { min-height: 30px; border-top: 0; font-size: 11px; }
  .row { display: grid; grid-template-columns: 1fr 1.2fr 1.2fr; align-items: center; }
  .r { text-align: right; }
  .k { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ink-2); }
  .k.sel { color: var(--ink); }
  .k i { width: 4px; height: 4px; background: var(--gold); transform: rotate(45deg); }
  .val { font-size: 15px; }
  .chg { font-size: 13px; }
  .bh { display: flex; align-items: baseline; justify-content: space-between; margin-top: 24px; }
  .bh h2 { font-size: 21px; font-style: italic; }
  .bh a { display: flex; align-items: center; height: 32px; font-size: 13px; color: var(--ink-2); }
  .note { margin-top: 14px; font-size: 12px; line-height: 1.5; color: var(--ink-3); }
</style>
