<script lang="ts">
  import LearnHeader from '../components/LearnHeader.svelte'
  import Screen from '../components/Screen.svelte'
  import { href } from '../lib/router.svelte'
  import { lessons } from '../content/lessons'
  import { progress } from '../lib/learnprogress.svelte'

  // Guides written by the screens agent (src/content/guides.ts) join the list if that file exists.
  const extra = import.meta.glob('../content/guides.ts', { eager: true }) as Record<string, any>
  interface Item { id: string; title: string; kind: string; reviewed: string | null; link: string }
  const guideItems: Item[] = []
  for (const mod of Object.values(extra)) {
    const list = mod.guides ?? mod.default
    const arr: any[] = Array.isArray(list) ? list : list ? Object.values(list) : []
    for (const g of arr) {
      guideItems.push({ id: 'guide:' + (g.id ?? g.title), title: g.title ?? g.id, kind: 'Guide', reviewed: g.reviewed ?? null, link: href('guide', g.id ?? '') })
    }
  }
  const items: Item[] = [
    ...guideItems,
    ...lessons.map((l) => ({ id: 'lesson:' + l.id, title: l.title, kind: l.group, reviewed: l.reviewed, link: href('lesson', l.id) })),
  ]
  const done = $derived(items.filter((i) => progress.isChecked(i.id)).length)
</script>

<Screen tab="learn">
  <LearnHeader title="Review guides" back="menu" />
  <p class="rise intro" style="--d:.06s">Every guide and lesson in Ibriz, in one list. Open one, read it, then tick it once you are happy with it.</p>
  <p class="rise count mono" style="--d:.1s">{done} of {items.length} checked</p>

  <ul class="rise" style="--d:.14s">
    {#each items as it}
      <li class="row">
        <button type="button" role="checkbox" aria-checked={progress.isChecked(it.id)} aria-label="Mark {it.title} as checked" class="box" class:on={progress.isChecked(it.id)} onclick={() => progress.toggleChecked(it.id)}>
          {#if progress.isChecked(it.id)}<svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true"><path d="M1 5l3.5 3.5L11 1.5" stroke="var(--on-gold)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>{/if}
        </button>
        <a href={it.link} class="tx"><span class="t1">{it.title}</span><span class="t2">{it.kind}{it.reviewed ? '' : ' · not yet reviewed'}</span></a>
      </li>
    {/each}
  </ul>
</Screen>

<style>
  .intro { margin-top: 14px; font-size: 15px; line-height: 1.5; color: var(--ink-2); }
  .count { margin: 10px 0 14px; font-size: 13px; color: var(--ink-3); }
  .row { gap: 6px; justify-content: flex-start; min-height: 58px; }
  .box { width: 44px; height: 44px; flex: none; display: flex; align-items: center; justify-content: center; margin-left: -10px; position: relative; }
  .box::before { content: ''; position: absolute; width: 24px; height: 24px; border-radius: 7px; border: 1px solid var(--line); }
  .box.on::before { background: var(--gold); border-color: var(--gold); }
  .box svg { position: relative; }
  .tx { display: flex; flex-direction: column; gap: 2px; flex: 1; padding: 8px 0; }
  .t1 { font-size: 16px; }
  .t2 { font-size: 13px; color: var(--ink-3); }
</style>
