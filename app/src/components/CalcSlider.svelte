<script lang="ts">
  // Percent slider: gold line with a diamond knob and a soft halo.
  let { value = $bindable(), min = 0, max, step, label }: { value: number; min?: number; max: number; step: number; label: string } = $props()
  const fillPct = $derived(((value - min) / (max - min)) * 100)
</script>

<input type="range" {min} {max} {step} bind:value aria-label={label} style="--p:{fillPct}%" />

<style>
  input { -webkit-appearance: none; appearance: none; width: 100%; height: 44px; background: transparent; margin: 6px 0 0; cursor: pointer; }
  input::-webkit-slider-runnable-track { height: 1px; background: linear-gradient(90deg, var(--gold) var(--p), var(--line) var(--p)); }
  input::-moz-range-track { height: 1px; background: linear-gradient(90deg, var(--gold) var(--p), var(--line) var(--p)); }
  input::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; margin-top: -7px; background: var(--gold); transform: rotate(45deg); box-shadow: 0 0 0 10px color-mix(in srgb, var(--gold) 14%, transparent); border: 0; }
  input::-moz-range-thumb { width: 14px; height: 14px; background: var(--gold); transform: rotate(45deg); border-radius: 0; border: 0; box-shadow: 0 0 0 10px color-mix(in srgb, var(--gold) 14%, transparent); }
</style>
