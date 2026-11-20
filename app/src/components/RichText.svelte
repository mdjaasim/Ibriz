<script lang="ts">
  import { fill, tokens } from '../content/learntext'
  import { href } from '../lib/router.svelte'
  import { rate } from '../lib/rate.svelte'
  let { text }: { text: string } = $props()
  // reading rate.config makes this re-render when the live config arrives
  const parts = $derived((rate.config, tokens(fill(text))))
</script>

{#each parts as p}{#if p.kind === 'term'}<a class="term" href={href('glossary', p.id)}>{p.label}</a>{:else}{p.text}{/if}{/each}

<style>
  .term { color: var(--ink); text-decoration: underline; text-decoration-color: var(--gold); text-underline-offset: 3px; text-decoration-thickness: 1px; }
</style>
