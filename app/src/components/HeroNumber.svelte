<script lang="ts">
  import { indian } from '../lib/format'
  // Each digit is a column that rolls from 0 to its value, staggered, then settles.
  let { value, size = 86 }: { value: number; size?: number } = $props()
  const chars = $derived(indian(Math.round(value)).split(''))
</script>

<span class="hero serif" style="font-size:{size}px" aria-hidden="true">
  {#each chars as c, i (i + ':' + chars.length)}
    {#if c === ','}
      <span class="comma rise" style="--d:.3s">,</span>
    {:else}
      <span class="dg"><span class="col" style="--n:{c};animation-delay:{0.1 + i * 0.06}s">
        {#each Array(Number(c) + 1) as _, d}<i>{d}</i>{/each}
      </span></span>
    {/if}
  {/each}
</span>

<style>
  .hero { display: flex; line-height: 1.08; letter-spacing: -0.02em; font-weight: 400; }
  .dg { display: inline-block; height: 1.08em; overflow: hidden; }
  .col { display: flex; flex-direction: column; line-height: 1.08em; transform: translateY(calc(var(--n) * -1.08em)); animation: roll var(--t-roll) var(--ease) both; }
  .col i { display: flex; justify-content: center; height: 1.08em; font-style: normal; }
  .comma { font-size: 0.6em; align-self: flex-end; margin: 0 0.03em 0.18em 0.01em; }
  @keyframes roll { from { transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) { .col { animation: none; } }
</style>
