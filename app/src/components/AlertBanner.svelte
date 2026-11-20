<script lang="ts">
  import { alerts } from '../lib/alerts.svelte'
  import { href } from '../lib/router.svelte'
  // Shows alerts that are true right now (works without push). Today shows price and move ones; My Gold the rest.
  let { kinds = ['price', 'move', 'monthly'] }: { kinds?: string[] } = $props()
  const hits = $derived(alerts.hits.filter((h) => kinds.includes(h.alert.kind)))
</script>

{#each hits as h (h.alert.id)}
  <aside class="banner" role="status">
    <div><p class="t">{h.title}</p><p class="b">{h.body}</p></div>
    <span class="acts">
      <a href={href('alerts')}>Alerts</a>
      <button type="button" onclick={() => alerts.dismiss(h.alert.id)}>Got it</button>
    </span>
  </aside>
{/each}

<style>
  .banner { margin-top: 12px; padding: 12px 14px; border-left: 1px solid var(--gold); background: var(--raised); border-radius: 0 12px 12px 0; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .t { font-size: 14px; color: var(--ink); }
  .b { margin-top: 2px; font-size: 13px; color: var(--ink-2); line-height: 1.4; }
  .acts { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; font-size: 13px; color: var(--gold-text); flex: none; }
  .acts a, .acts button { min-height: 32px; display: flex; align-items: center; color: var(--gold-text); }
  .acts a { color: var(--ink-3); }
</style>
