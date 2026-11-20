<script lang="ts">
  import { href } from '../lib/router.svelte'
  let { active }: { active: 'comparebuys' | 'goldranges' | 'whatif' } = $props()
  const tabs = [['comparebuys', 'Per piece'], ['goldranges', 'Ranges'], ['whatif', 'What if']] as const
</script>
<div role="tablist" aria-label="Compare" class="ct rise" style="--d:.06s">
  {#each tabs as [id, label]}
    <a href={href(id)} role="tab" aria-selected={id === active} class:on={id === active}>{label}</a>
  {/each}
</div>
<style>
  .ct { display: inline-flex; padding: 3px; border: 1px solid var(--line); border-radius: 20px; margin-top: 10px; }
  a { height: 34px; padding: 0 16px; display: flex; align-items: center; font-size: 13px; color: var(--ink-3); border-radius: 17px; }
  a.on { background: var(--raised); color: var(--ink); }
</style>
