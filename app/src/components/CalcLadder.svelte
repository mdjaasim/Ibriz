<script lang="ts">
  import Money from './Money.svelte'
  export interface Step { label: string; value: number; sign?: boolean }
  // Vertical gold hairline with ringed nodes; the total sits on a gold diamond in large serif.
  let { steps, total }: { steps: Step[]; total: { label: string; note: string; value: number } } = $props()
</script>

<ol>
  <i class="spine" aria-hidden="true"></i>
  {#each steps as s, n}
    <li class="rise" style="--d:{0.1 + n * 0.08}s"><i class="node"></i><span class="lbl2">{s.label}</span><Money value={s.value} size={16} sign={s.sign} /></li>
  {/each}
  <li class="total rise" style="--d:{0.1 + steps.length * 0.08}s">
    <i class="dia"></i>
    <span class="tl"><span class="t1">{total.label}</span><span class="t2">{total.note}</span></span>
    <Money value={Math.round(total.value)} size={42} serif />
  </li>
</ol>

<style>
  ol { position: relative; margin-top: 26px; }
  .spine { position: absolute; left: 4px; top: 12px; bottom: 34px; width: 1px; background: linear-gradient(180deg, color-mix(in srgb, var(--gold) 50%, transparent), color-mix(in srgb, var(--gold) 90%, transparent)); }
  li { position: relative; display: flex; justify-content: space-between; align-items: center; min-height: 36px; padding-left: 28px; gap: 12px; }
  .node { position: absolute; left: 0; width: 9px; height: 9px; border-radius: 50%; background: var(--ground); border: 1px solid var(--gold); }
  .lbl2 { font-size: 15px; color: var(--ink-2); }
  .total { margin-top: 10px; min-height: 64px; }
  .dia { position: absolute; left: -2px; width: 13px; height: 13px; background: var(--gold); transform: rotate(45deg); }
  .tl { display: flex; flex-direction: column; gap: 2px; }
  .t1 { font-size: 15px; }
  .t2 { font-size: 13px; color: var(--ink-3); }
</style>
