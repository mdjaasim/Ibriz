<script lang="ts">
  import { toast } from '../lib/toast.svelte'
</script>
{#if toast.text}<div class="toast" role="status">{toast.text}</div>{/if}
<style>
  .toast { position: fixed; left: 50%; transform: translateX(-50%); bottom: calc(90px + env(safe-area-inset-bottom)); background: var(--raised); color: var(--ink); border: 1px solid var(--line); padding: 12px 18px; border-radius: 14px; font-size: 14px; z-index: 30; animation: rise var(--t-rise) var(--ease) both; }
</style>
