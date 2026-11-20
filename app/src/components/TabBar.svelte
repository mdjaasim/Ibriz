<script lang="ts">
  import { router, href } from '../lib/router.svelte'
  const tabs = [
    { id: 'main', label: 'Today' },
    { id: 'charts', label: 'Charts' },
    { id: 'mygold', label: 'My Gold' },
    { id: 'learn', label: 'Learn' },
  ]
  let { active }: { active: string } = $props()
</script>

<nav aria-label="Main" class="bar">
  {#each tabs as t}
    <a href={href(t.id)} class="tab" class:on={t.id === active} aria-current={t.id === active ? 'page' : undefined}>
      {t.label}<i></i>
    </a>
  {/each}
</nav>

<style>
  .bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 5; display: flex; justify-content: space-around; max-width: 480px; margin: 0 auto; padding: 18px 18px calc(var(--nav-bottom) + env(safe-area-inset-bottom)); background: linear-gradient(to top, var(--ground) 62%, color-mix(in srgb, var(--ground) 85%, transparent) 82%, transparent); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
  .tab { height: 44px; min-width: 44px; padding: 0 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; font-size: 13px; color: var(--ink-3); }
  .tab.on { color: var(--ink); }
  i { width: 4px; height: 4px; }
  .on i { background: var(--gold); transform: rotate(45deg); }
</style>
