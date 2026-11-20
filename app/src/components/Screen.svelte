<script lang="ts">
  import type { Snippet } from 'svelte'
  import TabBar from './TabBar.svelte'
  // Page frame: side padding, top safe area, optional tab bar. Content scrolls with the page.
  let { tab, children, glow = false }: { tab?: string; children: Snippet; glow?: boolean } = $props()
</script>

<main class="screen" class:glow>
  {@render children()}
  {#if tab}<TabBar active={tab} />{/if}
</main>

<style>
  .screen { overflow-x: clip; position: relative; max-width: 480px; margin: 0 auto; min-height: 100dvh; padding: calc(var(--safe-top) - 10px + env(safe-area-inset-top)) var(--pad) 130px; }
  .glow::before { content: ''; position: absolute; left: -120px; top: 90px; width: 520px; height: 360px; background: radial-gradient(closest-side, color-mix(in srgb, var(--gold) 10%, transparent), transparent); pointer-events: none; }
</style>
