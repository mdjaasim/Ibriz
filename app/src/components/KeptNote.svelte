<script lang="ts">
  let { text = 'Kept only on this phone' }: { text?: string } = $props()
</script>
<p class="kept">
  <svg width="11" height="13" viewBox="0 0 11 13" fill="none" aria-hidden="true"><rect x="1" y="5.5" width="9" height="6.5" rx="1.5" stroke="var(--ink-3)" stroke-width="1.1"/><path d="M3 5.5V3.8a2.5 2.5 0 0 1 5 0v1.7" stroke="var(--ink-3)" stroke-width="1.1"/></svg>{text}
</p>
<style>
  .kept { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--ink-3); }
</style>
