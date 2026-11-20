<script lang="ts">
  import Wordmark from '../components/Wordmark.svelte'
  import OnbSteps from '../components/OnbSteps.svelte'
  import { href } from '../lib/router.svelte'
</script>

<main class="w">
  <div class="rise logo"><Wordmark size={34} /></div>
  <!-- decorative line only; not data -->
  <svg class="thread" viewBox="0 0 390 260" aria-hidden="true">
    <path class="draw" pathLength="1" d="M12 190 C40 184 70 182 95 172 C115 160 120 148 135 147 C150 150 155 160 172 150 C190 130 195 129 212 138 C235 152 250 175 280 180 C320 186 335 187 340 205 C348 235 365 262 378 292" stroke="var(--gold)" stroke-width="1.6" fill="none" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
  </svg>
  <div class="copy">
    <h1 class="serif rise">Gold,<br><em>plainly told.</em></h1>
    <p class="rise" style="--d:.1s">Today's rate for Tamil Nadu, what moved it, and what your own gold is worth.</p>
  </div>
  <div class="rise foot" style="--d:.2s">
    <div class="meta"><OnbSteps step={1} /><span>Indicative rates · not financial advice</span></div>
    <a href={href('onbcity')} class="btn primary">Begin</a>
  </div>
</main>

<style>
  .w { position: relative; max-width: 480px; margin: 0 auto; min-height: 100dvh; padding: calc(70px + env(safe-area-inset-top)) var(--pad) calc(28px + env(safe-area-inset-bottom)); display: flex; flex-direction: column; overflow: hidden; }
  .w::before { content: ''; position: absolute; left: -100px; top: 35%; width: 560px; height: 400px; background: radial-gradient(closest-side, color-mix(in srgb, var(--gold) 9%, transparent), transparent); pointer-events: none; }
  .logo { text-align: center; }
  .thread { width: calc(100% + 2 * var(--pad)); margin: 40px calc(var(--pad) * -1) 0; height: 260px; }
  .draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: draw var(--t-draw) var(--ease-draw) .35s forwards; }
  @keyframes draw { to { stroke-dashoffset: 0; } }
  .copy { margin-top: auto; }
  h1 { font-size: 46px; line-height: 1.04; letter-spacing: -0.01em; }
  h1 em { font-style: italic; }
  .copy p { margin-top: 18px; font-size: 17px; line-height: 1.55; color: var(--ink-2); }
  .foot { margin-top: 44px; }
  .meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; font-size: 12px; color: var(--ink-3); }
  @media (prefers-reduced-motion: reduce) { .draw { animation: none; stroke-dashoffset: 0; } }
</style>
