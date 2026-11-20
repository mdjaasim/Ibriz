<script lang="ts">
  import Main from './Main.svelte'
  import Sheet from '../components/Sheet.svelte'
  import { rate } from '../lib/rate.svelte'
  import { settings } from '../lib/settings.svelte'
  import { href } from '../lib/router.svelte'
  import { guides, fill, pctText } from '../content/guides'
  import { shortDate } from '../lib/format'

  const g = guides.find((x) => x.id === 'reading-the-rate')!
  const v = $derived({
    karat: settings.data.karat,
    duty: pctText(rate.latest?.duty ?? rate.config.duty),
    gst: pctText(rate.config.gstGold),
    makingGst: pctText(rate.config.gstMaking),
    sovereign: rate.config.gramsPerSovereign,
  })
</script>

<Main />
<Sheet label="Guide: reading the rate">
  <p class="label mono top">Guide · 30 seconds</p>
  <h1 class="serif">{g.title}</h1>
  {#each g.steps as s, i}
    <div class="g rise" style="--d:{0.1 + i * 0.07}s">
      <span class="mono n">{String(i + 1).padStart(2, '0')}</span>
      <div><h2>{s.h}</h2><p>{fill(s.p, v)}</p></div>
    </div>
  {/each}
  <div class="foot">
    <span>{g.reviewed ? 'Reviewed ' + shortDate(g.reviewed) : 'Draft, not yet reviewed'} · <a href={href('sources')}>Sources</a></span>
    <a href={href('lesson', 'how-rate-built')} class="gold">Full lesson →</a>
  </div>
</Sheet>

<style>
  .top { margin-top: 18px; }
  h1 { margin-top: 8px; font-size: 28px; letter-spacing: -0.01em; }
  .g { display: flex; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--line-soft); }
  .n { font-size: 12px; color: var(--gold-text); padding-top: 3px; }
  h2 { font-size: 15px; font-weight: 500; }
  p { margin-top: 4px; font-size: 14px; line-height: 1.55; color: var(--ink-2); }
  .foot { display: flex; justify-content: space-between; align-items: center; margin-top: 18px; font-size: 12px; color: var(--ink-3); }
  .foot a { text-decoration: underline; text-underline-offset: 3px; }
  .foot .gold { color: var(--gold-text); font-size: 13px; text-decoration: none; }
</style>
