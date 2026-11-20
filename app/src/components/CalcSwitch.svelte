<script lang="ts">
  import { href } from '../lib/router.svelte'
  let { active }: { active: 'calculator' | 'sell' } = $props()
</script>

<div class="rise seg" role="tablist" aria-label="Buying or selling" style="--d:.06s">
  <a href={href('calculator')} role="tab" aria-selected={active === 'calculator'} class:on={active === 'calculator'}>Buying</a>
  <a href={href('sell')} role="tab" aria-selected={active === 'sell'} class:on={active === 'sell'}>Selling</a>
</div>

<style>
  .seg { display: flex; padding: 4px; border: 1px solid var(--line); border-radius: 18px; margin-top: 18px; }
  a { flex: 1; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 14px; font-size: 15px; color: var(--ink-3); border: 1px solid transparent; }
  a.on { background: var(--raised); color: var(--ink); border-color: var(--line); }
</style>
