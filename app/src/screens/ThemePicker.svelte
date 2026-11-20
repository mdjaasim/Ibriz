<script lang="ts">
  import Menu from './Menu.svelte'
  import Sheet from '../components/Sheet.svelte'
  import { settings, type Theme } from '../lib/settings.svelte'
  import { router } from '../lib/router.svelte'
  const opts: { id: Theme; label: string }[] = [
    { id: 'night', label: 'Night' }, { id: 'day', label: 'Day' }, { id: 'system', label: 'Match phone' },
  ]
</script>

<Menu />
<Sheet label="Theme" top={400}>
  <div class="head"><h1 class="serif">Theme</h1><button type="button" onclick={() => router.back()}>Done</button></div>
  <div role="radiogroup" aria-label="Theme">
    {#each opts as o}
      <button type="button" role="radio" aria-checked={settings.data.theme === o.id} class="row" onclick={() => settings.set('theme', o.id)}>
        <span>{o.label}</span><i class:on={settings.data.theme === o.id}></i>
      </button>
    {/each}
  </div>
</Sheet>

<style>
  .head { display: flex; align-items: center; justify-content: space-between; margin: 18px 0 8px; }
  h1 { font-size: 26px; }
  .head button { height: 44px; font-size: 14px; color: var(--gold-text); }
  .row { width: 100%; text-align: left; }
  i { width: 6px; height: 6px; transform: rotate(45deg); }
  i.on { background: var(--gold); }
</style>
