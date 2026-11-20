<script lang="ts">
  // Vertical gold hairline with ringed nodes, values right-aligned, total on a gold diamond.
  let { steps, total }: { steps: { label: string; note?: string; value: string; unit?: string }[]; total: { label: string; value: string } } = $props()
</script>

<ol class="ladder">
  <i class="spine" aria-hidden="true"></i>
  {#each steps as s, i}
    <li class="step rise" style="--d:{0.6 + i * 0.08}s">
      <i class="node"></i>
      <span class="l">{s.label}{#if s.note}&nbsp;<span class="mono n">{s.note}</span>{/if}</span>
      <span class="mono v">{s.value}{#if s.unit}<span class="u">{s.unit}</span>{/if}</span>
    </li>
  {/each}
  <li class="step total rise" style="--d:{0.6 + steps.length * 0.08}s">
    <i class="dia"></i>
    <span class="l">{total.label}</span>
    <span class="serif tv">{total.value}</span>
  </li>
</ol>

<style>
  .ladder { position: relative; margin: 12px 0 0; }
  .spine { position: absolute; left: 4px; top: 12px; bottom: 30px; width: 1px; background: linear-gradient(180deg, color-mix(in srgb, var(--gold) 50%, transparent), color-mix(in srgb, var(--gold) 90%, transparent)); }
  .step { position: relative; display: flex; justify-content: space-between; align-items: center; min-height: 38px; padding-left: 24px; }
  .node { position: absolute; left: 0; width: 9px; height: 9px; border-radius: 50%; background: var(--sheet); border: 1px solid var(--gold); }
  .dia { position: absolute; left: 0; width: 9px; height: 9px; background: var(--gold); transform: rotate(45deg); }
  .l { font-size: 14px; color: var(--ink-2); }
  .n { font-size: 12px; color: var(--gold-text); }
  .v { font-size: 14px; }
  .u { color: var(--ink-3); }
  .total { min-height: 52px; }
  .total .l { color: var(--ink); }
  .tv { font-size: 26px; }
</style>
