<script lang="ts">
  import Screen from '../components/Screen.svelte'
  import HeroNumber from '../components/HeroNumber.svelte'
  import Money from '../components/Money.svelte'
  import KeptNote from '../components/KeptNote.svelte'
  import Chevron from '../components/Chevron.svelte'
  import MyGoldEmpty from './MyGoldEmpty.svelte'
  import { holdings } from '../lib/holdings.svelte'
  import { rate } from '../lib/rate.svelte'
  import { href } from '../lib/router.svelte'
  import { draft, formLabels } from '../lib/draft.svelte'
  import { pieceStats, portfolioStats } from '../lib/portfolio'
  import { backupDue } from '../lib/backup'
  import { gainColor, gainPctText, monthYear, rupee } from '../lib/mygold-bits'
  import { indian } from '../lib/format'

  const pieces = $derived(holdings.pieces)
  const st = $derived(portfolioStats(pieces, (k) => rate.perGram(k), (k) => rate.purity(k)))
  const rows = $derived(pieces.map((p) => ({ p, s: pieceStats(p, rate.perGram(p.karat), rate.config.defaultSellDeductionPct) })))
  const karats = $derived(Object.keys(st.gramsByKarat).map(Number))
  const oneKarat = $derived(karats.length === 1 ? karats[0] : null)
  const forms = $derived(Object.entries(st.gramsByForm))
  const behind = $derived(rows.filter((r) => r.s.gain !== null && r.s.gain < 0).sort((a, b) => a.s.gain! - b.s.gain!)[0])
  const dueBackup = $derived(backupDue(pieces.length > 0, rate.config.backupReminderDays))
  const g = (n: number) => +n.toFixed(2) + ' g'
</script>

{#if holdings.ready && !pieces.length}
  <MyGoldEmpty />
{:else}
<Screen tab="mygold" glow>
  <header class="rise top">
    <h1 class="serif">My Gold</h1>
    <a href={href('addpiece')} onclick={() => draft.reset()} aria-label="Add a piece" class="plus">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1v14M1 8h14" stroke="var(--gold-text)" stroke-width="1.4" stroke-linecap="round"/></svg>
    </a>
  </header>
  <div class="rise" style="--d:.05s;margin-top:4px"><KeptNote /></div>

  {#if pieces.length}
  <section class="rise worth" aria-label="Worth today" style="--d:.1s">
    <p class="label">Worth today</p>
    <div class="big"><span class="rs">₹</span><HeroNumber value={st.worth} size={54} /></div>
    {#if st.gain !== null && st.gainPct !== null}
      <p class="gl">
        <span class="mono" style="color:{gainColor(st.gain)}">{st.gain < 0 ? '−' : '+'}₹{indian(Math.abs(Math.round(st.gain)))}</span>
        <span class="mono" style="color:{gainColor(st.gain)}">{gainPctText(st.gainPct)}</span>
        <span class="ink3">on what you paid</span>
      </p>
    {:else}
      <p class="gl"><span class="ink3">Add what you paid to see your gain.</span></p>
    {/if}
  </section>

  <section class="rise made" aria-label="What it is made of" style="--d:.2s">
    <div class="bar" aria-hidden="true">
      {#each forms as [f, grams], i}<i style="flex:{grams};opacity:{1 - i * 0.28}"></i>{/each}
    </div>
    <div class="legend">
      {#each forms as [f, grams]}<span>{formLabels[f as keyof typeof formLabels] ?? f} <span class="mono ink3">{g(grams)}</span></span>{/each}
      <span class="mono ink3 tot">{g(st.grams)}{oneKarat ? ' · ' + oneKarat + 'K' : ''}</span>
    </div>
    {#if st.avgCostPerGram !== null && oneKarat}
      <p class="avg">Average cost <span class="mono">₹{indian(Math.round(st.avgCostPerGram))}</span> a gram. Today <span class="mono">₹{indian(Math.round(rate.perGram(oneKarat)))}</span>.</p>
    {:else if st.avgCostPerGram !== null}
      <p class="avg">Average cost <span class="mono">₹{indian(Math.round(st.avgCostPerGram))}</span> a gram across {karats.sort((a, b) => b - a).map((k) => k + 'K').join(', ')}.</p>
    {/if}
  </section>

  <section aria-label="Pieces" class="pieces">
    <div class="rise ph" style="--d:.25s"><h2 class="label">Pieces</h2><span class="mono ink3">{pieces.length}</span></div>
    {#each rows as { p, s }, i}
      <a href={href('piecedetail', p.id)} class="row item rise" style="--d:{0.3 + i * 0.05}s">
        <span class="nm"><span>{p.name}</span><span class="meta">{p.karat}K · {+p.netG.toFixed(2)} g{p.boughtAt ? ' · ' + monthYear(p.boughtAt) : ''}</span></span>
        <span class="rt"><span class="mono">{rupee(s.melt)}</span><span class="mono pc" style="color:{gainColor(s.gain)}">{gainPctText(s.gainPct)}</span></span>
      </a>
    {/each}
  </section>

  {#if behind && behind.s.breakEvenRate !== null}
    <aside class="rise nudge" style="--d:.45s">
      <p>Your {behind.p.name.toLowerCase()} gets back what you paid at <span class="mono">₹{indian(Math.round(behind.s.breakEvenRate))}</span> a gram.</p>
    </aside>
  {/if}
  {#if dueBackup}
    <aside class="rise nudge" style="--d:.5s"><p>You have no recent backup. <a href={href('backup')} class="gl2">Back up now</a></p></aside>
  {/if}

  <a href={href('comparebuys')} class="rise row cmp" style="--d:.55s">
    <span class="nm"><span>Compare your gold</span><span class="meta">Bought vs today · ranges · what if</span></span><Chevron />
  </a>
  <a href={href('backup')} class="rise row cmp" style="--d:.6s"><span>Back up your pieces</span><Chevron /></a>
  {/if}
</Screen>
{/if}

<style>
  .top { display: flex; align-items: center; justify-content: space-between; height: 44px; }
  h1 { font-size: 30px; letter-spacing: -0.01em; }
  .plus { width: 44px; height: 44px; display: flex; align-items: center; justify-content: flex-end; }
  .worth { margin-top: 18px; }
  .big { display: flex; align-items: flex-start; height: 60px; margin-top: 6px; }
  .rs { font-size: 22px; font-weight: 300; color: var(--gold-text); margin: 8px 5px 0 0; }
  .gl { margin-top: 8px; display: flex; gap: 10px; flex-wrap: wrap; font-size: 13px; }
  .ink3 { color: var(--ink-3); }
  .made { margin-top: 22px; }
  .bar { display: flex; gap: 3px; height: 4px; }
  .bar i { background: var(--gold); border-radius: 2px; }
  .legend { display: flex; gap: 18px; margin-top: 10px; font-size: 13px; color: var(--ink-2); }
  .tot { margin-left: auto; }
  .avg { margin-top: 10px; font-size: 13px; color: var(--ink-2); }
  .pieces { margin-top: 24px; }
  .ph { display: flex; justify-content: space-between; align-items: baseline; height: 32px; }
  .item { min-height: 58px; }
  .nm { display: flex; flex-direction: column; gap: 3px; }
  .meta { font-size: 12px; color: var(--ink-3); }
  .rt { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
  .rt .mono { font-size: 15px; }
  .pc { font-size: 12px !important; }
  .nudge { margin-top: 16px; font-size: 14px; line-height: 1.5; color: var(--ink-2); padding-left: 14px; border-left: 1px solid var(--gold); }
  .nudge .mono { color: var(--ink); }
  .gl2 { color: var(--gold-text); }
  .cmp { margin-top: 16px; min-height: 58px; }
  .cmp + .cmp { margin-top: 0; border-top: 0; }
</style>
