<script lang="ts">
  import { href } from '../lib/router.svelte'
  let { active }: { active: 'stagedbuying' | 'breakeven' | 'goals' } = $props()
  const tabs = [['stagedbuying', 'Buy in steps'], ['breakeven', 'Break-even'], ['goals', 'Goals']] as const
</script>
<div role="tablist" aria-label="Planners" class="pt rise" style="--d:.06s">
  {#each tabs as [id, label]}
    <a href={href(id)} role="tab" aria-selected={id === active} class:on={id === active}>{label}</a>
  {/each}
</div>
<style>
  .pt { display: flex; padding: 4px; border: 1px solid var(--line); border-radius: 18px; margin-top: 18px; }
  a { flex: 1; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 14px; font-size: 14px; color: var(--ink-3); border: 1px solid transparent; white-space: nowrap; }
  a.on { background: var(--raised); color: var(--ink); border-color: var(--line); }
</style>
