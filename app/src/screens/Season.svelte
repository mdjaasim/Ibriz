<script lang="ts">
  import { onMount } from 'svelte'
  import Screen from '../components/Screen.svelte'
  import LearnHeader from '../components/LearnHeader.svelte'
  import GuideLink from '../components/GuideLink.svelte'
  import { occasions } from '../content/festivals'
  import { rate } from '../lib/rate.svelte'
  import { settings } from '../lib/settings.svelte'
  import { href } from '../lib/router.svelte'
  import { fetchHistory, type History } from '../lib/history'
  import { readingFor } from '../lib/reading'
  import { daysUntil } from '../lib/planner'
  import { indian, shortDate } from '../lib/format'
  import { longDate } from '../lib/mygold-bits'

  let hist = $state<History | null>(null)
  onMount(async () => { hist = await fetchHistory('3m') })

  const karat = $derived(settings.data.karat)
  const k = $derived(rate.purity(karat) * rate.cityFactor)
  const today = $derived(rate.perGram(karat))
  const lo = $derived(hist?.low != null ? hist.low * k : null)
  const hi = $derived(hist?.high != null ? hist.high * k : null)
  const first = $derived(hist?.points[0]?.t ?? null)
  const reading = $derived(hist && lo !== null && hi !== null
    ? readingFor({ points: hist.points.map((p) => ({ v: p.v * k })), low: lo, high: hi }, today, 'the saved prices')
    : null)
  const pos = $derived(lo !== null && hi !== null && hi > lo ? Math.max(0, Math.min(100, ((today - lo) / (hi - lo)) * 100)) : 50)

  // upcoming only, soonest first; the data file lists them in date order
  const upcoming = $derived(occasions.map((o) => ({ ...o, days: daysUntil(o.date) })).filter((o) => o.days >= 0).sort((a, b) => a.days - b.days))
  const when = (d: number) => (d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : d < 60 ? `In ${d} days` : `In about ${Math.round(d / 30.44)} months`)
</script>

<Screen tab="learn">
  <LearnHeader title="Occasions" back="menu">
    {#snippet right()}<GuideLink id="gold-occasions" />{/snippet}
  </LearnHeader>

  <section class="rise now" style="--d:.06s" aria-label="Where today's price sits">
    <p class="label">Today’s {karat}K price</p>
    {#if reading && lo !== null && hi !== null}
      <p class="line serif">{reading.line}</p>
      <div class="rb" aria-hidden="true"><i class="track"></i><i class="dot" style="left:{pos}%"></i></div>
      <div class="ends mono"><span>Low ₹{indian(Math.round(lo))}</span><span>High ₹{indian(Math.round(hi))}</span></div>
      <p class="sub">Against the prices Ibriz has saved{first ? ' since ' + shortDate(first) : ''}. It looks backwards only.</p>
    {:else}
      <p class="sub">Loading the saved prices.</p>
    {/if}
  </section>

  <h2 class="rise label up" style="--d:.1s">Coming up</h2>
  {#if upcoming.length}
    <ul>
      {#each upcoming as o, i}
        <li class="rise" style="--d:{0.12 + i * 0.05}s">
          <div class="l">
            <span class="nm">{o.name}</span>
            <span class="dt">{longDate(o.date)}{o.confirmed ? '' : ' · date to be confirmed'}</span>
            {#if o.note}<span class="nt">{o.note}</span>{/if}
            <a class="src" href={o.source.url} target="_blank" rel="noopener noreferrer">{o.source.label}</a>
          </div>
          <span class="mono away">{when(o.days)}</span>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="sub" style="margin-top:12px">The dates for the coming year have not been added yet.</p>
  {/if}

  <p class="note">Dates come from public panchang calendars and can differ by a day, so check yours. Shops often run offers around these days: compare the whole bill, including making charges and GST. Nothing here predicts a price. For learning, not advice. <a href={href('lesson', 'gold-occasions')}>Read the lesson</a></p>
</Screen>

<style>
  .now { margin-top: 18px; padding-bottom: 20px; border-bottom: 1px solid var(--line); }
  .line { margin-top: 8px; font-size: 25px; line-height: 1.22; font-style: italic; text-wrap: balance; }
  .rb { position: relative; height: 16px; margin-top: 18px; }
  .track { position: absolute; left: 0; right: 0; top: 7px; height: 2px; background: linear-gradient(90deg, var(--line), var(--gold)); opacity: .7; }
  .dot { position: absolute; top: 3px; width: 10px; height: 10px; background: var(--gold); transform: translateX(-50%) rotate(45deg); box-shadow: 0 0 0 7px color-mix(in srgb, var(--gold) 14%, transparent); }
  .ends { display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; color: var(--ink-3); }
  .sub { margin-top: 10px; font-size: 13px; line-height: 1.5; color: var(--ink-3); }
  .up { margin-top: 22px; }
  ul { margin-top: 6px; }
  li { display: flex; justify-content: space-between; gap: 14px; padding: 14px 0; border-top: 1px solid var(--line); }
  li:last-child { border-bottom: 1px solid var(--line); }
  .l { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  .nm { font-size: 16px; }
  .dt { font-size: 13px; color: var(--ink-2); }
  .nt { font-size: 13px; line-height: 1.4; color: var(--ink-3); }
  .src { font-size: 12px; color: var(--ink-3); text-decoration: underline; text-underline-offset: 3px; min-height: 24px; display: inline-flex; align-items: center; }
  .away { font-size: 13px; color: var(--gold-text); white-space: nowrap; padding-top: 3px; }
  .note { margin-top: 16px; font-size: 13px; line-height: 1.5; color: var(--ink-3); }
  .note a { color: var(--gold-text); text-decoration: underline; text-underline-offset: 3px; }
</style>
