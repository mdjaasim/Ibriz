<script lang="ts">
  import Screen from '../components/Screen.svelte'
  import KeptNote from '../components/KeptNote.svelte'
  import { href } from '../lib/router.svelte'
  import { draft } from '../lib/draft.svelte'
</script>

<Screen tab="mygold" glow>
  <header class="rise top">
    <h1 class="serif">My Gold</h1>
    <a href={href('addpiece')} onclick={() => draft.reset()} aria-label="Add a piece" class="plus">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1v14M1 8h14" stroke="var(--gold-text)" stroke-width="1.4" stroke-linecap="round"/></svg>
    </a>
  </header>
  <div class="mid">
    <h2 class="serif rise" style="--d:.1s">Your gold,<br><span>valued every day</span></h2>
    <p class="rise body" style="--d:.2s">Add what you own: jewellery, coins or bars. Ibriz values it at today's rate.</p>
    <a href={href('addpiece')} onclick={() => draft.reset()} class="btn primary rise" style="--d:.3s">Add your first piece</a>
    <div class="rise" style="--d:.4s"><KeptNote /></div>
  </div>
</Screen>

<style>
  .top { display: flex; align-items: center; justify-content: space-between; height: 44px; }
  h1 { font-size: 30px; letter-spacing: -0.01em; }
  .plus { width: 44px; height: 44px; display: flex; align-items: center; justify-content: flex-end; }
  .mid { display: flex; flex-direction: column; gap: 18px; margin-top: 18vh; }
  h2 { font-size: 40px; line-height: 1.1; letter-spacing: -0.01em; }
  h2 span { font-style: italic; color: var(--gold-text); }
  .body { font-size: 16px; line-height: 1.55; color: var(--ink-2); max-width: 30ch; }
</style>
