<script lang="ts">
  import Screen from '../components/Screen.svelte'
  import PurityBars from '../components/PurityBars.svelte'
  import { href } from '../lib/router.svelte'
  import { chapters, lessons } from '../content/lessons'
  import { progress } from '../lib/learnprogress.svelte'

  const next = $derived(lessons.find((l) => !progress.isRead(l.id)) ?? lessons[0])
  const stat = (title: string) => {
    const all = lessons.filter((l) => l.group === title)
    return { n: all.filter((l) => progress.isRead(l.id)).length, of: all.length, first: all.find((l) => !progress.isRead(l.id)) ?? all[0] }
  }
</script>

<Screen tab="learn">
  <header class="rise top">
    <h1 class="serif">Learn</h1>
    <a href={href('glossary')}>Glossary</a>
  </header>

  <article class="rise up" style="--d:.1s">
    <p class="label gold mono">Up next · {next.minutes ?? 2} min</p>
    <h2 class="serif">{next.title}</h2>
    {#if next.summary}<p class="sum">{next.summary}</p>{/if}
    {#if next.figure === 'purity'}<PurityBars highlight={22} />{/if}
    <a class="read" href={href('lesson', next.id)}>Read the lesson<svg width="16" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true"><path d="M1 5h11M8.5 1.5 12 5 8.5 8.5" stroke="var(--gold-text)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
  </article>

  <section aria-label="Chapters" class="chs">
    <div class="rise label" style="--d:.2s">Chapters</div>
    {#each chapters as c, i}
      {@const s = stat(c.title)}
      <a href={href('lesson', s.first.id)} class="ch rise" style="--d:{0.25 + i * 0.06}s">
        <span class="serif num" class:on={s.n > 0}>{c.numeral}</span>
        <span class="t"><span class="t1">{c.title}</span><span class="t2">{c.blurb}</span></span>
        <span class="mono cnt">{s.n}/{s.of}</span>
      </a>
    {/each}
  </section>
</Screen>

<style>
  .top { display: flex; align-items: baseline; justify-content: space-between; height: 44px; }
  h1 { font-size: 30px; letter-spacing: -0.01em; }
  .top a { font-size: 15px; color: var(--ink-2); height: 44px; display: flex; align-items: center; }
  .up { margin-top: 18px; }
  .gold { color: var(--gold-text); }
  h2 { font-size: 36px; line-height: 1.05; letter-spacing: -0.01em; margin-top: 12px; text-wrap: balance; }
  .sum { margin-top: 14px; font-size: 16px; line-height: 1.5; color: var(--ink-2); }
  .read { display: inline-flex; align-items: center; gap: 8px; height: 44px; margin-top: 16px; font-size: 16px; color: var(--gold-text); }
  .chs { margin-top: 26px; }
  .chs .label { margin-bottom: 12px; }
  .ch { display: flex; align-items: center; gap: 18px; min-height: 59px; padding: 10px 0; border-top: 1px solid var(--line); }
  .ch:last-child { border-bottom: 1px solid var(--line); }
  .num { width: 36px; font-size: 20px; color: var(--ink-3); }
  .num.on { color: var(--gold-text); }
  .t { flex: 1; display: flex; flex-direction: column; gap: 3px; }
  .t1 { font-size: 17px; }
  .t2 { font-size: 14px; color: var(--ink-3); }
  .cnt { font-size: 14px; color: var(--ink-3); }
</style>
