<script lang="ts">
  import Screen from '../components/Screen.svelte'
  import { rate } from '../lib/rate.svelte'
  import { router } from '../lib/router.svelte'
  import { facts } from '../content/guides'
  import { pctText } from '../content/guides'
</script>

<Screen>
  <header class="rise top">
    <button type="button" aria-label="Back" class="back" onclick={() => router.back('menu')}>
      <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true"><path d="M8 2 2 8l6 6" stroke="var(--ink-2)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <h1 class="serif">Sources and terms</h1>
  </header>

  <section class="rise" style="--d:.05s">
    <h2 class="label">Where the numbers come from</h2>
    {#each facts.sources as s}
      <div class="row"><span>{s.name}</span><span class="v">{s.how} <a href={s.url} target="_blank" rel="noreferrer">{s.link}</a></span></div>
    {/each}
    <div class="row"><span>Import duty</span><span class="v">{pctText(rate.latest?.duty ?? rate.config.duty)} since {facts.dutySince}</span></div>
    <div class="row"><span>Shop premium</span><span class="v">Set by you, per city</span></div>
  </section>

  <section class="rise" style="--d:.11s">
    <h2 class="label">What Ibriz is not</h2>
    <p>Rates are indicative, not a shop quote. Readings and signals are for learning, not financial advice. Check the rate with your jeweller before you buy or sell.</p>
  </section>

  <section class="rise" style="--d:.17s">
    <h2 class="label">Your data</h2>
    <p>My Gold lives only on this phone. An alert stores a price and a notification address, nothing about what you own.</p>
  </section>

  <p class="foot rise" style="--d:.23s">Draft, not yet reviewed by the owner</p>
</Screen>

<style>
  .top { display: flex; align-items: center; gap: 4px; height: 44px; }
  .back { width: 36px; height: 44px; display: flex; align-items: center; }
  h1 { font-size: 30px; letter-spacing: -0.01em; }
  section { margin-top: 28px; }
  h2 { margin-bottom: 6px; }
  .row { gap: 16px; }
  .v { font-size: 14px; color: var(--ink-2); text-align: right; }
  .v a { color: var(--gold-text); text-decoration: underline; text-underline-offset: 3px; }
  p { font-size: 14px; line-height: 1.6; color: var(--ink-2); }
  .foot { margin-top: 28px; font-size: 12px; color: var(--ink-3); }
</style>
