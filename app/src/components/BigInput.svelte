<script lang="ts">
  // A large serif number on a gold underline, with its unit beside it (the design's input style).
  let { value = $bindable(), label, unit, hint, id, prefix = '', maxlength = 9, inputmode = 'decimal' }: {
    value: string; label: string; unit?: string; hint?: string; id: string; prefix?: string; maxlength?: number; inputmode?: 'decimal' | 'numeric' | 'text'
  } = $props()
</script>

<div class="field">
  <label class="label" for={id}>{label}</label>
  <div class="inp">
    {#if prefix}<span class="pre">{prefix}</span>{/if}
    <input {id} class="serif" {inputmode} placeholder="0" bind:value {maxlength} autocomplete="off" />
    {#if unit}<span class="unit">{unit}</span>{/if}
  </div>
  {#if hint}<p class="hint">{hint}</p>{/if}
</div>

<style>
  .field { margin-top: 26px; }
  .inp { display: flex; align-items: flex-end; gap: 10px; margin-top: 8px; padding-bottom: 6px; border-bottom: 1px solid var(--gold); }
  .pre { font-size: 22px; font-weight: 300; color: var(--gold-text); padding-bottom: 12px; }
  input { width: 100%; min-width: 0; background: none; border: 0; outline: 0; font-size: 48px; line-height: 1.1; padding: 0; caret-color: var(--gold); }
  input::placeholder { color: var(--ink-3); }
  .unit { font-size: 20px; color: var(--ink-2); padding-bottom: 8px; flex: none; }
  .hint { margin-top: 10px; font-size: 14px; color: var(--ink-3); }
</style>
