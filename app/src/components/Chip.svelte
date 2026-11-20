<script lang="ts">
  let { on = false, label, onclick, mono = false }: { on?: boolean; label: string; onclick: () => void; mono?: boolean } = $props()
</script>
<button type="button" role="radio" aria-checked={on} class="chip" class:on class:mono {onclick}>{label}</button>
<style>
  .chip { height: 40px; padding: 0 18px; border-radius: var(--radius-chip); border: 1px solid var(--line); font-size: 14px; color: var(--ink-2); }
  .chip.on { background: var(--raised); color: var(--ink); border-color: color-mix(in srgb, var(--gold) 55%, transparent); }
</style>
