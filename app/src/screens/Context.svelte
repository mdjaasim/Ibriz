<script lang="ts">
  import { onMount } from 'svelte'
  import Screen from '../components/Screen.svelte'
  import LearnHeader from '../components/LearnHeader.svelte'
  import GuideLink from '../components/GuideLink.svelte'
  import RichText from '../components/RichText.svelte'
  import { contextEvents } from '../content/context'
  import { rate } from '../lib/rate.svelte'
  import { settings } from '../lib/settings.svelte'
  import { href } from '../lib/router.svelte'
  import { fetchHistory, type History } from '../lib/history'
  import { biggestMoves } from '../lib/planner'
  import { plannerLimits as L } from '../lib/plannerconfig'
  import { indian, pct, shortDate } from '../lib/format'
  import { longDate } from '../lib/mygold-bits'

  let hist = $state<History | null>(null)
  let loaded = $state(false)
  onMount(async () => { hist = await fetchHistory('3m'); loaded = true })

  const karat = $derived(settings.data.karat)
  const k = $derived(rate.purity(karat) * rate.cityFactor)
  const moves = $derived(hist ? biggestMoves(hist.points.map((p) => ({ t: p.t, v: p.v * k })), L.topMoves) : [])
  const first = $derived(hist?.points[0]?.t ?? null)
  const events = $derived([...contextEvents].sort((a, b) => b.date.localeCompare(a.date)))
</script>

<Screen tab="learn">
  <LearnHeader title="What moved the price" back="menu">
    {#snippet right()}<GuideLink id="what-moved-the-price" />{/snippet}
  </LearnHeader>
  <p class="rise lead" style="--d:.04s">Dated changes, and the biggest days in the prices Ibriz has saved.</p>

  <h2 class="rise label sec" style="--d:.08s">Dated changes</h2>
  {#each events as e, i}
    <article class="rise ev" style="--d:{0.1 + i * 0.06}s">
      <p class="date mono">{longDate(e.date)}</p>
      <h3 class="serif">{e.title}</h3>
      <p class="body"><RichText text={e.body} /></p>
      <a class="src" href={e.source.url} target="_blank" rel="noopener noreferrer">{e.source.label}</a>
    </article>
  {/each}

  <h2 class="rise label sec" style="--d:.2s">Biggest days{first ? ' since ' + shortDate(first) : ''}</h2>
  {#if moves.length}
    <ul>
      {#each moves as m, i}
        <li class="rise" style="--d:{0.22 + i * 0.05}s">
          <div><span class="when">{longDate(new Date(m.t).toISOString().slice(0, 10))}</span><span class="fr mono">₹{indian(Math.round(m.from))} to ₹{indian(Math.round(m.to))} a gram, {karat}K</span></div>
          <span class="mono pc" style="color:var(--{m.pct < 0 ? 'down' : 'up'})">{m.pct < 0 ? '−' : '+'}{pct(m.pct, 1)}</span>
        </li>
      {/each}
    </ul>
    <p class="note">Ibriz shows when these happened, not why. A jump can come from the world price, the rupee or a policy change. Compare the date with the changes above.</p>
  {:else if loaded}
    <p class="note">Not enough saved prices yet.</p>
  {:else}
    <div class="shimmer" style="height:60px;margin-top:12px"></div>
  {/if}

  <p class="note">Past moves do not tell you what comes next. For learning, not advice. <a href={href('lesson', 'what-moved-the-price')}>Read the lesson</a></p>
</Screen>

<style>
  .lead { margin-top: 12px; font-size: 16px; line-height: 1.5; color: var(--ink-2); }
  .sec { margin-top: 26px; }
  .ev { margin-top: 12px; padding: 14px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
  .date { font-size: 12px; color: var(--gold-text); }
  h3 { margin-top: 4px; font-size: 22px; }
  .body { margin-top: 8px; font-size: 15px; line-height: 1.55; color: var(--ink-2); }
  .src { display: inline-flex; align-items: center; min-height: 32px; font-size: 12px; color: var(--ink-3); text-decoration: underline; text-underline-offset: 3px; }
  ul { margin-top: 8px; }
  li { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 58px; border-top: 1px solid var(--line); }
  li:last-child { border-bottom: 1px solid var(--line); }
  li > div { display: flex; flex-direction: column; gap: 2px; }
  .when { font-size: 15px; }
  .fr { font-size: 12px; color: var(--ink-3); }
  .pc { font-size: 17px; }
  .note { margin-top: 14px; font-size: 13px; line-height: 1.5; color: var(--ink-3); }
  .note a { color: var(--gold-text); text-decoration: underline; text-underline-offset: 3px; }
</style>
