<script lang="ts">
  import type { Snippet } from 'svelte'
  import { router } from '../lib/router.svelte'
  // Bottom sheet over the current screen. Closing goes back one step.
  let { label, children, top = 112 }: { label: string; children: Snippet; top?: number } = $props()
  const close = () => router.back()
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && close()} />
<button class="scrim" aria-label="Close" onclick={close}></button>
<section class="sheet" aria-label={label} style="top:{top}px">
  <div class="grab" aria-hidden="true"></div>
  <div class="body">{@render children()}</div>
</section>

<style>
  .scrim { position: fixed; inset: 0; background: var(--scrim); z-index: 10; animation: fadein .4s ease both; }
  .sheet { position: fixed; left: 0; right: 0; bottom: 0; max-width: 480px; margin: 0 auto; z-index: 11; background: var(--sheet); border-radius: var(--radius-sheet) var(--radius-sheet) 0 0; box-shadow: 0 -1px 0 var(--line), 0 -30px 60px rgba(0,0,0,.35); padding: 0 var(--pad); animation: spring var(--t-sheet) var(--ease-spring) both; display: flex; flex-direction: column; }
  .grab { width: 36px; height: 4px; border-radius: 2px; background: var(--line); margin: 10px auto 0; flex: none; }
  .body { overflow-y: auto; padding-bottom: calc(40px + env(safe-area-inset-bottom)); }
  @keyframes spring { from { transform: translateY(100%); } to { transform: none; } }
  @keyframes fadein { from { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .sheet, .scrim { animation: none; } }
</style>
