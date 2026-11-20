<script lang="ts">
  import Main from './Main.svelte'
  import Charts from './Charts.svelte'
  import MyGold from './MyGold.svelte'
  import Calculator from './Calculator.svelte'
  import Alerts from './Alerts.svelte'
  import Compare from './Compare.svelte'
  import StagedBuying from './StagedBuying.svelte'
  import BreakEven from './BreakEven.svelte'
  import Goals from './Goals.svelte'
  import Season from './Season.svelte'
  import Context from './Context.svelte'
  import Sheet from '../components/Sheet.svelte'
  import { rate } from '../lib/rate.svelte'
  import { settings } from '../lib/settings.svelte'
  import { href } from '../lib/router.svelte'
  import { guides, fill, pctText, facts } from '../content/guides'
  import { shortDate } from '../lib/format'

  let { param = '' }: { param?: string } = $props()
  const g = $derived(guides.find((x) => x.id === param) ?? guides[0])
  const parents = { main: Main, charts: Charts, mygold: MyGold, calculator: Calculator, alerts: Alerts, compare: Compare, stagedbuying: StagedBuying, breakeven: BreakEven, goals: Goals, season: Season, context: Context }
  const Parent = $derived(parents[g.parent])
  const v = $derived({
    karat: settings.data.karat,
    city: settings.data.city,
    premium: pctText(rate.latest?.premium ?? rate.config.premium),
    duty: pctText(rate.latest?.duty ?? rate.config.duty),
    gst: pctText(rate.config.gstGold),
    makingGst: pctText(rate.config.gstMaking),
    sovereign: rate.config.gramsPerSovereign,
    dutySince: facts.dutySince,
  })
</script>

<Parent />
<Sheet label="Guide: {g.title}">
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
    {#if g.lesson}<a href={href('lesson', g.lesson)} class="gold">Full lesson →</a>{/if}
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
