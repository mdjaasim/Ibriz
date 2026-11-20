<script lang="ts">
  import { onMount } from 'svelte'
  import RichText from '../components/RichText.svelte'
  import PurityBars from '../components/PurityBars.svelte'
  import Screen from '../components/Screen.svelte'
  import { href, router } from '../lib/router.svelte'
  import { chapters, lessons } from '../content/lessons'
  import { progress } from '../lib/learnprogress.svelte'
  import { shortDate } from '../lib/format'

  let { param = '' }: { param?: string } = $props()
  const idx = $derived(Math.max(0, lessons.findIndex((l) => l.id === param)))
  const lesson = $derived(lessons[idx])
  const next = $derived(lessons[idx + 1])
  const chapter = $derived(chapters.find((c) => c.title === lesson.group))
  const inChapter = $derived(lessons.filter((l) => l.group === lesson.group))
  const pos = $derived(inChapter.findIndex((l) => l.id === lesson.id) + 1)

  let pctRead = $state(0)
  function onScroll() {
    const h = document.documentElement
    pctRead = Math.min(100, Math.round((h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)) * 100))
  }
  onMount(() => progress.markRead(lesson.id))
</script>

<svelte:window onscroll={onScroll} />
<div class="prog" aria-hidden="true"><i style="width:{pctRead}%"></i></div>

<Screen tab="learn">
  <header class="rise">
    <button type="button" class="back" aria-label="Back" onclick={() => router.back('learn')}>
      <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true"><path d="M8 2 2 8l6 6" stroke="var(--ink)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <span class="mono min">{lesson.minutes ?? 2} min</span>
  </header>

  <article>
    <p class="label rise">{chapter?.numeral} · {lesson.group} · {pos} of {inChapter.length}</p>
    <h1 class="serif rise" style="--d:.06s">{lesson.title}</h1>
    <div class="body rise" style="--d:.12s">
      {#each lesson.body as para}
        {#if para === '@figure'}
          {#if lesson.figure === 'purity'}<PurityBars highlight={22} />{/if}
        {:else}
          <p><RichText text={para} /></p>
        {/if}
      {/each}
    </div>

    <footer class="rise meta" style="--d:.18s">
      {#if lesson.reviewed}
        <p>Last reviewed {shortDate(lesson.reviewed)}</p>
      {:else}
        <p>Draft, not yet reviewed.</p>
      {/if}
      {#if lesson.sources?.length}
        <p class="label">Sources</p>
        <ul>
          {#each lesson.sources as s}<li><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>{/each}
        </ul>
      {/if}
      <p class="note">For learning, not advice. Rates in Ibriz are indicative.</p>
    </footer>
  </article>

  {#if next}
    <a href={href('lesson', next.id)} class="next rise" style="--d:.24s">
      <span><span class="label">Next</span><span class="serif nt">{next.title}</span></span>
      <svg width="16" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true"><path d="M1 5h11M8.5 1.5 12 5 8.5 8.5" stroke="var(--gold-text)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </a>
  {:else}
    <a href={href('learn')} class="next rise"><span class="serif nt">Back to Learn</span></a>
  {/if}
</Screen>

<style>
  .prog { position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 6; }
  .prog i { display: block; height: 2px; background: var(--gold); transition: width .2s linear; }
  header { display: flex; align-items: center; justify-content: space-between; height: 44px; }
  .back { width: 44px; height: 44px; margin-left: -12px; display: flex; align-items: center; justify-content: center; }
  .min { font-size: 13px; color: var(--ink-3); }
  article { margin-top: 18px; }
  h1 { font-size: 40px; line-height: 1.05; letter-spacing: -0.015em; margin-top: 14px; text-wrap: balance; }
  .body { margin-top: 22px; }
  .body p { font-size: 16px; line-height: 1.68; color: var(--ink-2); margin-top: 16px; }
  .meta { margin-top: 28px; font-size: 13px; color: var(--ink-3); }
  .meta .label { margin-top: 14px; }
  .meta ul { margin-top: 6px; }
  .meta li a { color: var(--ink-2); text-decoration: underline; text-underline-offset: 3px; text-decoration-color: var(--line); line-height: 2; }
  .note { margin-top: 14px; }
  .next { display: flex; align-items: center; justify-content: space-between; min-height: 72px; margin-top: 28px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
  .next > span { display: flex; flex-direction: column; gap: 4px; }
  .nt { font-size: 21px; }
</style>
