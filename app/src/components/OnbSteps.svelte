<script lang="ts">
  let { step }: { step: 1 | 2 | 3 } = $props()
</script>
<div class="steps" role="img" aria-label="Step {step} of 3">
  {#each [1, 2, 3] as n}<i class:on={n === step}></i>{/each}
</div>
<style>
  .steps { display: flex; align-items: center; gap: 10px; }
  i { width: 6px; height: 6px; background: var(--ink-3); opacity: .5; transform: rotate(45deg); }
  i.on { width: 9px; height: 9px; background: var(--gold); opacity: 1; }
</style>
