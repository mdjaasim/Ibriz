<script lang="ts">
  import Screen from '../components/Screen.svelte'
  import { rate } from '../lib/rate.svelte'
  import { settings } from '../lib/settings.svelte'
  import { alerts } from '../lib/alerts.svelte'
  import { subscribe } from '../lib/push'
  import { router, href } from '../lib/router.svelte'
  import { toast } from '../lib/toast.svelte'
  import { indian } from '../lib/format'

  const k = $derived(settings.data.karat)
  const now = $derived(Math.round(rate.perGram(k)))
  const c = $derived(rate.change(k))
  const target = $derived(Math.round((now * 0.99) / 10) * 10)
  let busy = $state(false)
  let pstate = $state(alerts.pushState)
  let message = $state('')

  async function turnOn() {
    busy = true
    message = ''
    try {
      if (!rate.config.vapidPublic) throw new Error('Notifications are not set up on the server yet.')
      await subscribe(rate.config.vapidPublic)
      toast.show('Notifications are on')
    } catch (e) {
      message = (e as Error).message
    } finally {
      busy = false
      pstate = alerts.pushState
    }
  }
</script>

<Screen tab="main">
  <header class="rise top">
    <button type="button" class="back" aria-label="Back" onclick={() => router.back('alerts')}>
      <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true"><path d="M8 2 2 8l6 6" stroke="var(--ink-2)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
  </header>
  <p class="label rise" style="--d:.04s">Alerts</p>
  <h1 class="serif rise" style="--d:.08s">How they arrive</h1>
  <p class="lead rise" style="--d:.12s">Short, specific, and never about what you own.</p>

  <div class="cards rise" style="--d:.16s">
    <div class="n"><span class="ico serif" aria-hidden="true">ı<i></i></span><div><div class="h"><span>{k}K is below ₹{indian(target)}</span><span class="when">now</span></div><p>Now ₹{indian(now)} a gram in {settings.data.city}. Tap for today's rate.</p></div></div>
    <div class="n"><span class="ico serif" aria-hidden="true">ı<i></i></span><div><div class="h"><span>Gold moved {c ? Math.abs(c.pct).toFixed(1) : '1.6'}% today</span><span class="when">10:42</span></div><p>{k}K is {c && c.abs > 0 ? 'up' : 'down'} ₹{indian(Math.abs(Math.round(c?.abs ?? 184)))} since yesterday.</p></div></div>
    <div class="n"><span class="ico serif" aria-hidden="true">ı<i></i></span><div><div class="h"><span>Your monthly gold check</span><span class="when">1st</span></div><p>Open Ibriz to see what your gold is worth.</p></div></div>
  </div>

  <section class="rise perm" style="--d:.2s">
    <h2 class="label">Notifications on this phone</h2>
    {#if pstate === 'ok'}
      <p>{typeof Notification !== 'undefined' && Notification.permission === 'granted' ? 'Allowed. New alerts can use notifications.' : 'Not turned on yet. Turn them on so alerts reach you when Ibriz is closed.'}</p>
      {#if typeof Notification !== 'undefined' && Notification.permission !== 'granted'}
        <button type="button" class="btn primary" disabled={busy} onclick={turnOn}>{busy ? 'Asking…' : 'Turn on notifications'}</button>
      {/if}
    {:else if pstate === 'install'}
      <p>On iPhone, notifications work once Ibriz is on your Home Screen (iOS 16.4 or newer). Until then, alerts show inside the app.</p>
      <a href={href('onbinstall')} class="btn secondary">How to add it</a>
    {:else if pstate === 'denied'}
      <p>Notifications are blocked for Ibriz. Allow them in your browser or phone settings. Until then, alerts show inside the app.</p>
    {:else}
      <p>This browser cannot show notifications, so alerts show inside the app.</p>
    {/if}
    {#if message}<p class="err" role="alert">{message}</p>{/if}
  </section>

  <p class="rise note" style="--d:.24s">An alert sends only a price and this phone's notification address to Ibriz. What you own never leaves your phone. Overnight alerts wait until morning if you keep quiet hours on.</p>
</Screen>

<style>
  .top { display: flex; align-items: center; height: 44px; }
  .back { width: 44px; height: 44px; margin-left: -12px; display: flex; align-items: center; justify-content: center; }
  h1 { font-size: 38px; margin-top: 6px; letter-spacing: -0.01em; }
  .lead { margin-top: 8px; font-size: 15px; color: var(--ink-2); }
  .cards { margin-top: 22px; display: flex; flex-direction: column; gap: 10px; }
  .n { display: flex; gap: 12px; padding: 12px; background: var(--raised); border-radius: 18px; border: 1px solid var(--line-soft); }
  .ico { position: relative; flex: none; width: 36px; height: 36px; border-radius: 9px; background: var(--ground); display: flex; align-items: center; justify-content: center; font-size: 24px; line-height: 1; }
  .ico i { position: absolute; top: 8px; left: 50%; width: 5px; height: 5px; background: var(--gold); transform: translateX(-50%) rotate(45deg); }
  .h { display: flex; justify-content: space-between; gap: 10px; font-size: 14px; font-weight: 500; }
  .when { font-size: 12px; font-weight: 400; color: var(--ink-3); }
  .n p { margin-top: 2px; font-size: 13px; line-height: 1.4; color: var(--ink-2); }
  .perm { margin-top: 28px; }
  .perm p { margin: 8px 0 14px; font-size: 14px; line-height: 1.55; color: var(--ink-2); }
  .perm .btn { margin-top: 4px; }
  .err { color: var(--down); }
  .note { margin-top: 22px; font-size: 13px; line-height: 1.5; color: var(--ink-3); }
</style>
