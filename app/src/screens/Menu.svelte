<script lang="ts">
  import Chevron from '../components/Chevron.svelte'
  import Wordmark from '../components/Wordmark.svelte'
  import Screen from '../components/Screen.svelte'
  import { settings } from '../lib/settings.svelte'
  import { rate } from '../lib/rate.svelte'
  import { href, router } from '../lib/router.svelte'
  import pkg from '../../package.json'

  const themeName = { night: 'Night', day: 'Day', system: 'Match phone' }
  function cycleKarat() {
    const ks = rate.config.karats
    settings.set('karat', ks[(ks.indexOf(settings.data.karat) + 1) % ks.length])
  }
  type Row = { label: string; value?: string; to?: string; act?: () => void }
  const sections: { h: string; rows: Row[] }[] = $derived([
    { h: 'Rates', rows: [
      { label: 'City', value: settings.data.city, to: href('citypicker') },
      { label: 'Show first', value: `${settings.data.karat}K · per gram`, act: cycleKarat },
    ] },
    { h: 'Alerts', rows: [
      { label: 'Price alerts', to: href('alerts') },
      { label: 'How alerts arrive', to: href('notifications') },
    ] },
    { h: 'Tools', rows: [
      { label: 'Calculator', to: href('calculator') },
      { label: 'Buy in steps', to: href('stagedbuying') },
      { label: 'Break-even', to: href('breakeven') },
      { label: 'Goals', to: href('goals') },
      { label: 'Check a hallmark', to: href('hallmark') },
    ] },
    { h: 'Learn more', rows: [
      { label: 'Ways to hold gold', to: href('compare') },
      { label: 'Gold occasions', to: href('season') },
      { label: 'What moved the price', to: href('context') },
    ] },
    { h: 'Your gold', rows: [{ label: 'Back up My Gold', to: href('backup') }] },
    { h: 'Display', rows: [{ label: 'Theme', value: themeName[settings.data.theme], to: href('themepicker') }] },
    { h: 'About', rows: [
      { label: 'How rates are worked out', to: href('ratesheet') },
      { label: 'Sources and terms', to: href('sources') },
    ] },
  ])
</script>

<Screen tab="main">
  <header class="rise top">
    <Wordmark />
    <button type="button" aria-label="Close" class="x" onclick={() => router.back()}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 2l10 10M12 2 2 12" stroke="var(--ink-2)" stroke-width="1.4" stroke-linecap="round"/></svg>
    </button>
  </header>
  {#each sections as s, i}
    <section class="rise" style="--d:{0.05 + i * 0.06}s">
      <h2 class="label">{s.h}</h2>
      {#each s.rows as r}
        {#if r.to}
          <a href={r.to} class="row"><span>{r.label}</span><span class="v">{r.value ?? ''}<Chevron /></span></a>
        {:else}
          <button type="button" class="row" onclick={r.act}><span>{r.label}</span><span class="v">{r.value}<Chevron /></span></button>
        {/if}
      {/each}
    </section>
  {/each}
  <p class="foot rise" style="--d:.4s">Ibriz shows indicative rates for learning and tracking. It is not financial advice. Version {pkg.version}</p>
</Screen>

<style>
  .top { display: flex; align-items: center; justify-content: space-between; height: 44px; }
  .x { width: 44px; height: 44px; display: flex; align-items: center; justify-content: flex-end; }
  section { margin-top: 26px; }
  h2 { margin-bottom: 4px; }
  .row { width: 100%; text-align: left; }
  .v { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--ink-2); }
  .foot { margin-top: 28px; font-size: 12px; line-height: 1.5; color: var(--ink-3); }
</style>
