<script lang="ts">
  import { onMount, tick } from 'svelte'
  import LearnHeader from '../components/LearnHeader.svelte'
  import Screen from '../components/Screen.svelte'
  import RichText from '../components/RichText.svelte'
  import { glossary } from '../content/glossary'

  let { param = '' }: { param?: string } = $props()
  let q = $state('')
  const shown = $derived(glossary.filter((t) => !q.trim() || t.term.toLowerCase().includes(q.trim().toLowerCase())))
  const letters = $derived([...new Set(shown.map((t) => t.term[0].toUpperCase()))].sort())

  onMount(async () => {
    if (!param) return
    await tick()
    document.getElementById('term-' + param)?.scrollIntoView({ block: 'center' })
  })
</script>

<Screen tab="learn">
  <LearnHeader title="Glossary" back="learn" />
  <label class="search rise" style="--d:.06s">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="5" stroke="var(--ink-3)" stroke-width="1.3"/><path d="m11 11 3.5 3.5" stroke="var(--ink-3)" stroke-width="1.3" stroke-linecap="round"/></svg>
    <input type="search" placeholder="Search terms" aria-label="Search terms" bind:value={q} />
  </label>

  <div class="list">
    {#each letters as L, i}
      <div class="grp rise" style="--d:{0.1 + i * 0.04}s">
        <span class="serif L">{L}</span>
        <dl>
          {#each shown.filter((t) => t.term[0].toUpperCase() === L) as t}
            <div class="t" id="term-{t.id}" class:hit={t.id === param}>
              <dt>{t.term}</dt>
              <dd><RichText text={t.meaning} /></dd>
            </div>
          {/each}
        </dl>
      </div>
    {:else}
      <p class="none">No term matches “{q}”.</p>
    {/each}
  </div>
</Screen>

<style>
  .search { display: flex; align-items: center; gap: 10px; height: 48px; margin-top: 14px; padding: 0 14px; background: var(--raised); border-radius: 14px; }
  input { flex: 1; background: none; border: 0; outline: 0; font-size: 16px; min-width: 0; }
  input::placeholder { color: var(--ink-3); }
  .list { margin-top: 12px; }
  .grp { display: flex; gap: 18px; padding: 18px 0; border-top: 1px solid var(--line); }
  .L { width: 36px; font-size: 22px; color: var(--gold-text); }
  dl { margin: 0; flex: 1; display: flex; flex-direction: column; gap: 18px; }
  dt { font-size: 17px; }
  dd { margin: 4px 0 0; font-size: 14px; line-height: 1.5; color: var(--ink-2); }
  .hit dt { color: var(--gold-text); }
  .none { margin-top: 24px; color: var(--ink-2); }
</style>
