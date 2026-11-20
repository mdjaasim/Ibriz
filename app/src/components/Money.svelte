<script lang="ts">
  // Rupee amount: the ₹ is light, gold, small and raised; Indian grouping.
  import { indian } from '../lib/format'
  let { value, decimals = 0, size = 17, serif = false, sign = false }: {
    value: number; decimals?: number; size?: number; serif?: boolean; sign?: boolean
  } = $props()
  const neg = $derived(value < 0)
  const text = $derived(indian(Math.abs(value), decimals))
</script>

<span class={serif ? 'serif' : 'mono'} style="font-size:{size}px;white-space:nowrap">
  {#if neg}&minus;{:else if sign && value > 0}+{/if}{#if size >= 24}<span class="r" style="font-size:{size * 0.4}px">₹</span>{:else}₹{/if}{text}
</span>

<style>
  .r { font-family: var(--font-text); font-weight: 300; color: var(--gold-text); vertical-align: 0.55em; margin-right: 0.12em; }
</style>
