<script lang="ts">
  import { href } from '../lib/router.svelte'
  // The "?" beside a screen's title: opens that screen's micro-guide.
  let { id, label = 'How to read this screen' }: { id: string; label?: string } = $props()
</script>

<a href={href('guide', id)} class="q" aria-label={label}><span>?</span></a>

<style>
  .q { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; }
  .q span { width: 26px; height: 26px; border-radius: 50%; border: 1px solid var(--line); display: flex; align-items: center; justify-content: center; font-size: 13px; color: var(--ink-2); }
</style>
