<script lang="ts">
  import Screen from '../components/Screen.svelte'
  import LearnHeader from '../components/LearnHeader.svelte'
  import GuideLink from '../components/GuideLink.svelte'
  import { ways, sgbNote } from '../content/ways'
  import { fill } from '../content/learntext'
  import { rate } from '../lib/rate.svelte'
  import { href } from '../lib/router.svelte'
  // reading rate.config re-renders the {tokens} when the live config arrives
  const t = (s: string) => (rate.config, fill(s))
</script>

<Screen tab="learn">
  <LearnHeader title="Ways to hold gold" back="menu">
    {#snippet right()}<GuideLink id="which-form-suits-you" />{/snippet}
  </LearnHeader>
  <p class="rise lead" style="--d:.04s">The same gold, with different costs and protections.</p>

  <div class="list">
    {#each ways as w, i}
      <section class="rise" style="--d:{0.08 + i * 0.06}s" aria-label={w.name}>
        <h2 class="serif">{w.name}</h2>
        <dl>
          <div><dt>Extra cost</dt><dd>{t(w.cost)}</dd></div>
          <div><dt>Protection</dt><dd class:warn={w.unregulated}>{t(w.protection)}</dd></div>
          <div><dt>Selling</dt><dd>{t(w.selling)}</dd></div>
        </dl>
      </section>
    {/each}
  </div>

  <p class="rise note" style="--d:.34s">{sgbNote} <a href={href('lesson', 'sgb')}>Read the lesson</a></p>
  <p class="rise note" style="--d:.38s">For learning, not advice. <a href={href('lesson', 'which-form-suits-you')}>The full guide</a></p>
</Screen>

<style>
  .lead { margin-top: 12px; font-size: 16px; line-height: 1.5; color: var(--ink-2); }
  .list { margin-top: 12px; border-top: 1px solid var(--line); }
  section { padding: 16px 0; border-bottom: 1px solid var(--line); }
  h2 { font-size: 21px; margin-bottom: 8px; }
  dl { margin: 0; display: flex; flex-direction: column; gap: 4px; }
  dl div { display: grid; grid-template-columns: 78px 1fr; column-gap: 12px; font-size: 14px; line-height: 1.45; }
  dt { color: var(--ink-3); }
  dd { margin: 0; color: var(--ink); }
  dd.warn { color: var(--down); }
  .note { margin-top: 14px; font-size: 13px; line-height: 1.5; color: var(--ink-3); }
  .note a { color: var(--gold-text); text-decoration: underline; text-underline-offset: 3px; }
</style>
