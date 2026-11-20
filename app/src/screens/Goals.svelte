<script lang="ts">
  import Screen from '../components/Screen.svelte'
  import LearnHeader from '../components/LearnHeader.svelte'
  import GuideLink from '../components/GuideLink.svelte'
  import PlannerTabs from '../components/PlannerTabs.svelte'
  import BigInput from '../components/BigInput.svelte'
  import Chip from '../components/Chip.svelte'
  import Money from '../components/Money.svelte'
  import KeptNote from '../components/KeptNote.svelte'
  import { rate } from '../lib/rate.svelte'
  import { settings } from '../lib/settings.svelte'
  import { holdings } from '../lib/holdings.svelte'
  import { goals, type Goal } from '../lib/goals.svelte'
  import { toast } from '../lib/toast.svelte'
  import { buy, parseNumber } from '../lib/calc'
  import { portfolioStats } from '../lib/portfolio'
  import { goalPlan, monthsUntil, daysUntil } from '../lib/planner'
  import { plannerLimits as L } from '../lib/plannerconfig'
  import { longDate } from '../lib/mygold-bits'

  let adding = $state(false)
  let name = $state('')
  let mode = $state<'grams' | 'rupees'>('grams')
  let targetText = $state('')
  let karat = $state(settings.data.karat)
  let deadline = $state('')

  const pstats = $derived(portfolioStats(holdings.pieces, (k) => rate.perGram(k), (k) => rate.purity(k)))
  const minDate = $derived(new Date(Date.now() + 86400000).toISOString().slice(0, 10))
  const maxDate = $derived(new Date(Date.now() + L.goalMaxYears * 366 * 86400000).toISOString().slice(0, 10))
  const target = $derived(parseNumber(targetText))
  const valid = $derived(target > 0 && deadline >= minDate && deadline <= maxDate)

  function save() {
    if (!valid) return
    goals.add({ name: name.trim() || (mode === 'grams' ? `${target} g of ${karat}K` : 'My goal'), mode, target, karat, deadline })
    name = ''; targetText = ''; deadline = ''; adding = false
    toast.show('Goal saved on this phone')
  }

  function calc(g: Goal) {
    const per = rate.perGram(g.karat)
    const allIn = buy({ weightG: 1, ratePerG: per, makingPct: 0, gstGoldPct: rate.config.gstGold * 100, gstMakingPct: rate.config.gstMaking * 100 }).allInPerG
    const have = rate.purity(g.karat) > 0 ? pstats.gramsPure24 / rate.purity(g.karat) : 0
    const months = monthsUntil(g.deadline, L.daysPerMonth)
    return { ...goalPlan({ mode: g.mode, target: g.target, haveGrams: have, allInPerG: allIn, ratePerG: per, months }), months, passed: daysUntil(g.deadline) <= 0 }
  }
  const gt = (n: number) => String(Math.round(n * 100) / 100)
</script>

<Screen tab="learn">
  <LearnHeader title="Plan" back="menu">
    {#snippet right()}<GuideLink id="saving-goals" />{/snippet}
  </LearnHeader>
  <PlannerTabs active="goals" />

  {#if !goals.list.length && !adding}
    <section class="rise empty" style="--d:.1s">
      <h2 class="serif">Set a gold goal</h2>
      <p>Pick an amount of gold or a sum of rupees and a date. Ibriz works out what to put in each month at today’s price.</p>
      <button type="button" class="btn primary" onclick={() => (adding = true)}>Add a goal</button>
    </section>
  {/if}

  {#each goals.list as g, i (g.id)}
    {@const c = calc(g)}
    <article class="rise goal" style="--d:{0.1 + i * 0.06}s">
      <div class="gh">
        <h2 class="serif">{g.name}</h2>
        <button type="button" class="rm" aria-label="Remove goal {g.name}" onclick={() => goals.remove(g.id)}>Remove</button>
      </div>
      <p class="sub">{g.mode === 'grams' ? `${gt(g.target)} g of ${g.karat}K` : `₹${g.target.toLocaleString('en-IN')} of ${g.karat}K gold`} by {longDate(g.deadline)}</p>
      <div class="bar" role="progressbar" aria-valuenow={Math.round(c.progressPct)} aria-valuemin="0" aria-valuemax="100" aria-label="Progress"><i style="width:{c.progressPct}%"></i></div>
      <p class="row2"><span>{gt(c.haveGrams)} g held of {gt(c.targetGrams)} g</span><span class="mono">{Math.round(c.progressPct)}%</span></p>
      {#if c.done}
        <p class="need">You have reached this goal.</p>
      {:else if c.passed}
        <p class="need">The date has passed. Remove the goal or set a new one.</p>
      {:else}
        <p class="need"><Money value={Math.round(c.monthly)} size={22} serif /> <span>a month for {c.months} {c.months === 1 ? 'month' : 'months'}</span></p>
        <p class="hint">Needs about {gt(c.needGrams)} g more, at today’s price with {Math.round(rate.config.gstGold * 1000) / 10}% GST.</p>
      {/if}
    </article>
  {/each}

  {#if goals.list.length && !adding}
    <button type="button" class="btn secondary addbtn" onclick={() => (adding = true)}>Add another goal</button>
  {/if}

  {#if adding}
    <section class="rise form" aria-label="New goal">
      <h2 class="serif">New goal</h2>
      <div class="inp2">
        <label class="label" for="gname">Name (optional)</label>
        <input id="gname" type="text" placeholder="Daughter’s wedding" bind:value={name} maxlength="40" autocomplete="off" />
      </div>
      <div class="chips" role="radiogroup" aria-label="Goal in">
        <Chip on={mode === 'grams'} label="Grams of gold" onclick={() => (mode = 'grams')} />
        <Chip on={mode === 'rupees'} label="Rupees" onclick={() => (mode = 'rupees')} />
      </div>
      <BigInput id="gt" label="Target" unit={mode === 'grams' ? 'grams' : ''} prefix={mode === 'rupees' ? '₹' : ''} bind:value={targetText} />
      <div class="chips" role="radiogroup" aria-label="Purity">
        {#each rate.config.karats as k}<Chip on={k === karat} label="{k}K" mono onclick={() => (karat = k)} />{/each}
      </div>
      <div class="inp2">
        <label class="label" for="gd">By</label>
        <input id="gd" type="date" min={minDate} max={maxDate} bind:value={deadline} />
      </div>
      <div class="btns">
        <button type="button" class="btn primary" disabled={!valid} onclick={save}>Save goal</button>
        <button type="button" class="btn secondary" onclick={() => (adding = false)}>Cancel</button>
      </div>
    </section>
  {/if}

  <div class="rise" style="--d:.3s;margin-top:18px"><KeptNote /></div>
  <p class="note">Progress counts all the gold in My Gold. The monthly amount is arithmetic at today’s price, not a forecast, and it changes when the price does. For learning, not advice.</p>
</Screen>

<style>
  .empty { margin-top: 28px; }
  .empty h2 { font-size: 26px; }
  .empty p { margin: 8px 0 20px; font-size: 15px; line-height: 1.55; color: var(--ink-2); }
  .goal { margin-top: 22px; padding-top: 18px; border-top: 1px solid var(--line); }
  .gh { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
  .gh h2 { font-size: 24px; }
  .rm { font-size: 13px; color: var(--ink-3); min-height: 44px; padding-left: 8px; }
  .sub { margin-top: 2px; font-size: 14px; color: var(--ink-2); }
  .bar { height: 3px; background: var(--line); margin-top: 14px; border-radius: 2px; overflow: hidden; }
  .bar i { display: block; height: 100%; background: var(--gold); }
  .row2 { display: flex; justify-content: space-between; margin-top: 8px; font-size: 13px; color: var(--ink-3); }
  .need { margin-top: 12px; font-size: 15px; color: var(--ink-2); display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
  .hint { margin-top: 4px; font-size: 13px; color: var(--ink-3); }
  .addbtn { margin-top: 22px; }
  .form { margin-top: 24px; }
  .form h2 { font-size: 26px; }
  .chips { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
  .inp2 { margin-top: 22px; display: flex; flex-direction: column; gap: 8px; }
  .inp2 input { height: 48px; background: var(--raised); border: 1px solid var(--line); border-radius: 12px; padding: 0 14px; font-size: 16px; }
  .btns { display: flex; flex-direction: column; gap: 10px; margin-top: 26px; }
  .note { margin-top: 14px; font-size: 13px; line-height: 1.5; color: var(--ink-3); }
</style>
