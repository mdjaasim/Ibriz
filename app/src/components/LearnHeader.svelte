<script lang="ts">
  import type { Snippet } from 'svelte'
  import { router } from '../lib/router.svelte'
  let { title, back = 'main', right }: { title?: string; back?: string; right?: Snippet } = $props()
</script>

<header class="rise">
  <div class="l">
    <button type="button" class="back" aria-label="Back" onclick={() => router.back(back)}>
      <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true"><path d="M8 2 2 8l6 6" stroke="var(--ink)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    {#if title}<h1 class="serif">{title}</h1>{/if}
  </div>
  {#if right}{@render right()}{/if}
</header>

<style>
  header { display: flex; align-items: center; justify-content: space-between; min-height: 44px; }
  .l { display: flex; align-items: center; gap: 14px; }
  .back { width: 44px; height: 44px; margin-left: -12px; display: flex; align-items: center; justify-content: center; }
  h1 { font-size: 30px; letter-spacing: -0.01em; }
</style>
