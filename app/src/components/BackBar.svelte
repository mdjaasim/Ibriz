<script lang="ts">
  import type { Snippet } from 'svelte'
  import { router } from '../lib/router.svelte'
  let { to = 'mygold', right, title }: { to?: string; right?: Snippet; title?: string } = $props()
</script>

<header class="rise bb">
  <button type="button" class="back" aria-label="Back" onclick={() => router.back(to)}>
    <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true"><path d="M8 2 2 8l6 6" stroke="var(--ink-2)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
    {#if title}<span class="serif">{title}</span>{/if}
  </button>
  {#if right}{@render right()}{/if}
</header>

<style>
  .bb { display: flex; align-items: center; justify-content: space-between; height: 44px; }
  .back { display: flex; align-items: center; gap: 14px; height: 44px; min-width: 44px; }
  .back span { font-size: 30px; letter-spacing: -0.01em; }
</style>
