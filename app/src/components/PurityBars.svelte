<script lang="ts">
  import { rate } from '../lib/rate.svelte'
  import { fill } from '../content/learntext'
  // Gold content by purity: one bar per karat, the highlighted one in bright gold.
  let { highlight }: { highlight?: number } = $props()
  const rows = $derived((rate.config, rate.config.karats.map((k) => ({ k, share: Math.min(rate.config.purity[String(k)] ?? 0, 0.999) / 0.999, text: fill(`{purity:${k}}`) }))))
</script>

<figure aria-label="Gold content by purity: {rows.map((r) => `${r.k}K ${r.text}`).join(', ')}">
  {#each rows as r}
    <div class="k" class:on={r.k === highlight}>
      <span class="mono">{r.k}K</span>
      <span class="track"><i style="width:{r.share * 100}%"></i></span>
      <span class="mono v">{r.text}</span>
    </div>
  {/each}
</figure>

<style>
  figure { margin: 22px 0 0; display: flex; flex-direction: column; gap: 4px; }
  .k { display: grid; grid-template-columns: 40px 1fr 56px; align-items: center; height: 30px; font-size: 13px; color: var(--ink-3); }
  .track { height: 2px; display: flex; }
  .track i { display: block; height: 2px; background: color-mix(in srgb, var(--gold) 50%, transparent); }
  .on { color: var(--ink); }
  .on .track i { background: var(--gold); height: 3px; }
  .v { text-align: right; }
</style>
