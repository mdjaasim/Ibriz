<script lang="ts">
  let { on, label, onchange }: { on: boolean; label: string; onchange: (v: boolean) => void } = $props()
</script>
<button type="button" role="switch" aria-checked={on} aria-label={label} class="sw" class:on onclick={() => onchange(!on)}><i></i></button>
<style>
  .sw { flex: none; width: 46px; height: 28px; border-radius: 14px; background: var(--raised); border: 1px solid var(--line); position: relative; }
  .sw i { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: var(--ink-3); transition: transform .3s var(--ease), background .3s; }
  .sw.on { background: var(--gold); border-color: var(--gold); }
  .sw.on i { transform: translateX(18px); background: var(--on-gold); }
</style>
