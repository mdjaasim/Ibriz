<script lang="ts">
  import OnbSteps from '../components/OnbSteps.svelte'
  import { settings } from '../lib/settings.svelte'
  import { router } from '../lib/router.svelte'

  function finish() {
    settings.set('onboarded', true)
    router.go('main')
  }
  const steps = [
    { t: 'Tap Share', d: 'The square with an arrow, at the bottom of Safari.' },
    { t: 'Add to Home Screen', d: 'Scroll the list a little to find it.' },
    { t: 'Open Ibriz from the icon', d: 'It now opens full screen, like an app.' },
  ]
</script>

<main class="o">
  <div class="rise bar"><OnbSteps step={3} /><button type="button" class="skip" onclick={finish}>Later</button></div>
  <div class="copy">
    <p class="label rise">On iPhone</p>
    <h1 class="serif rise" style="--d:.05s">Keep Ibriz on your Home Screen</h1>
    <p class="sub rise" style="--d:.1s">It opens full screen like an app, loads faster, and keeps your rate on screen even with a weak signal.</p>
  </div>
  <ol>
    {#each steps as s, i}
      <li class="rise" style="--d:{0.15 + i * 0.07}s">
        <span class="ic" aria-hidden="true"><i></i></span>
        <span><span class="t"><span class="mono n">{String(i + 1).padStart(2, '0')}</span>{s.t}</span><span class="d">{s.d}</span></span>
      </li>
    {/each}
  </ol>
  <p class="and rise" style="--d:.4s">On Android, tap Install when Chrome offers it.</p>
  <div class="rise foot" style="--d:.45s"><button type="button" class="btn primary" onclick={finish}>I've done it</button></div>
</main>

<style>
  .o { max-width: 480px; margin: 0 auto; min-height: 100dvh; padding: calc(54px + env(safe-area-inset-top)) var(--pad) calc(28px + env(safe-area-inset-bottom)); display: flex; flex-direction: column; }
  .bar { display: flex; align-items: center; justify-content: space-between; height: 44px; }
  .skip { height: 44px; font-size: 14px; color: var(--ink-2); }
  .copy { margin-top: 28px; }
  h1 { margin-top: 10px; font-size: 36px; line-height: 1.1; letter-spacing: -0.01em; }
  .sub { margin-top: 14px; font-size: 15px; line-height: 1.55; color: var(--ink-2); }
  ol { margin-top: 28px; }
  li { display: flex; gap: 16px; padding: 16px 0; border-top: 1px solid var(--line); }
  li:last-child { border-bottom: 1px solid var(--line); }
  .ic { width: 36px; height: 36px; border: 1px solid var(--line); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex: none; }
  .ic i { width: 8px; height: 8px; background: var(--gold); transform: rotate(45deg); }
  .t { display: flex; align-items: center; gap: 10px; font-size: 16px; }
  .n { font-size: 12px; color: var(--gold-text); }
  .d { display: block; margin-top: 4px; font-size: 14px; line-height: 1.5; color: var(--ink-2); }
  .and { margin-top: 16px; font-size: 13px; color: var(--ink-3); }
  .foot { margin-top: auto; padding-top: 28px; }
</style>
