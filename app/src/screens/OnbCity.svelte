<script lang="ts">
  import OnbSteps from '../components/OnbSteps.svelte'
  import { rate } from '../lib/rate.svelte'
  import { settings } from '../lib/settings.svelte'
  import { router } from '../lib/router.svelte'

  // First-draft Tamil names; a native speaker must check them before release (DESIGN.md section 6).
  const ta: Record<string, string> = { Chennai: 'சென்னை', Coimbatore: 'கோயம்புத்தூர்', Madurai: 'மதுரை', Trichy: 'திருச்சி' }
</script>

<main class="o">
  <div class="rise bar"><OnbSteps step={2} /><button type="button" class="skip" onclick={() => router.go('onbinstall')}>Skip</button></div>
  <div class="copy">
    <p class="label rise">Your city</p>
    <h1 class="serif rise" style="--d:.05s">Where do you buy your gold?</h1>
    <p class="sub rise" style="--d:.1s">Shops across Tamil Nadu quote close to one rate. Your city lets Ibriz fine-tune it.</p>
  </div>
  <div role="radiogroup" aria-label="City" class="list">
    {#each rate.config.cities as c, i}
      <button type="button" role="radio" aria-checked={settings.data.city === c} class="rise item" style="--d:{0.15 + i * 0.06}s" onclick={() => settings.set('city', c)}>
        <span><span class="serif">{c}</span>{#if ta[c]}<span class="ta">{ta[c]}</span>{/if}</span>
        <i class="ring"><b class:on={settings.data.city === c}></b></i>
      </button>
    {/each}
  </div>
  <div class="rise foot" style="--d:.45s"><a href="#/onbinstall" class="btn primary">Continue</a></div>
</main>

<style>
  .o { max-width: 480px; margin: 0 auto; min-height: 100dvh; padding: calc(54px + env(safe-area-inset-top)) var(--pad) calc(28px + env(safe-area-inset-bottom)); display: flex; flex-direction: column; }
  .bar { display: flex; align-items: center; justify-content: space-between; height: 44px; }
  .skip { height: 44px; font-size: 14px; color: var(--ink-2); }
  .copy { margin-top: 28px; }
  h1 { margin-top: 10px; font-size: 36px; line-height: 1.1; letter-spacing: -0.01em; }
  .sub { margin-top: 14px; font-size: 15px; line-height: 1.55; color: var(--ink-2); }
  .list { margin-top: 28px; }
  .item { width: 100%; display: flex; align-items: center; justify-content: space-between; min-height: 64px; border-top: 1px solid var(--line); text-align: left; }
  .item:last-child { border-bottom: 1px solid var(--line); }
  .item .serif { font-size: 24px; }
  .ta { margin-left: 12px; font-size: 14px; color: var(--ink-3); }
  .ring { width: 18px; height: 18px; border-radius: 50%; border: 1px solid var(--line); display: flex; align-items: center; justify-content: center; }
  .ring b { width: 8px; height: 8px; border-radius: 50%; background: transparent; }
  .ring b.on { background: var(--gold); }
  [aria-checked='true'] .ring { border-color: var(--gold); }
  .foot { margin-top: auto; padding-top: 28px; }
</style>
