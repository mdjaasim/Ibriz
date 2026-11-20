<script lang="ts">
  import Screen from '../components/Screen.svelte'
  import Switch from '../components/Switch.svelte'
  import GuideLink from '../components/GuideLink.svelte'
  import { alerts, type LocalAlert } from '../lib/alerts.svelte'
  import { rate } from '../lib/rate.svelte'
  import { router, href } from '../lib/router.svelte'
  import { toast } from '../lib/toast.svelte'

  let editing = $state(false)
  const monthly = $derived(alerts.list.find((a) => a.kind === 'monthly'))
  const rows = $derived(alerts.list.filter((a) => a.kind !== 'monthly'))
  const hour = (h: number) => `${((h + 11) % 12) + 1}:00 ${h < 12 ? 'am' : 'pm'}`
  const quietText = $derived(`${hour(rate.config.quietStartHour)} – ${hour(rate.config.quietEndHour)}`)
  const canPush = $derived(alerts.pushState === 'ok' && !!rate.config.vapidPublic)

  async function toggleMonthly(on: boolean) {
    if (monthly) return alerts.setActive(monthly.id, on)
    if (!on) return
    try {
      await alerts.add({ kind: 'monthly', karat: rate.config.defaultKarat, channel: canPush ? 'push' : 'app' })
    } catch (e) {
      toast.show((e as Error).message)
    }
  }
</script>

<Screen tab="main">
  <header class="rise top">
    <div class="l">
      <button type="button" class="back" aria-label="Back" onclick={() => router.back('menu')}>
        <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true"><path d="M8 2 2 8l6 6" stroke="var(--ink-2)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <h1 class="serif">Alerts</h1>
    </div>
    <div class="r">
      <GuideLink id="setting-a-useful-alert" label="How to set a useful alert" />
      <a href={href('newalert')} aria-label="New alert" class="plus"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1v14M1 8h14" stroke="var(--gold-text)" stroke-width="1.4" stroke-linecap="round"/></svg></a>
    </div>
  </header>

  {#if rows.length === 0 && !monthly}
    <p class="rise empty" style="--d:.05s">No alerts yet. Set one and Ibriz tells you when the price gets there.</p>
  {/if}

  <div class="rise list" style="--d:.06s">
    {#each rows as a (a.id)}
      {@const l = alerts.label(a)}
      <div class="row">
        <span class="t"><span>{l.title}</span><span class="s">{l.sub}</span></span>
        {#if editing}
          <button type="button" class="rm" onclick={() => alerts.remove(a.id)} aria-label="Remove {l.title}">Remove</button>
        {:else}
          <Switch on={a.active} label={l.title} onchange={(v) => alerts.setActive(a.id, v)} />
        {/if}
      </div>
    {/each}
    <div class="row">
      <span class="t"><span>Monthly gold check</span><span class="s">On the 1st · {monthly ? (monthly.channel === 'push' ? 'notification' : 'in the app') : canPush ? 'notification' : 'in the app'}</span></span>
      {#if editing && monthly}
        <button type="button" class="rm" onclick={() => alerts.remove(monthly.id)} aria-label="Remove monthly gold check">Remove</button>
      {:else}
        <Switch on={!!monthly?.active} label="Monthly gold check" onchange={toggleMonthly} />
      {/if}
    </div>
  </div>

  {#if rows.length || monthly}
    <button type="button" class="rise edit" style="--d:.1s" onclick={() => (editing = !editing)}>{editing ? 'Done' : 'Edit'}</button>
  {/if}

  <section class="rise" style="--d:.12s">
    <h2 class="label">Quiet hours</h2>
    <div class="row">
      <span class="t"><span>Hold alerts overnight</span><span class="s mono">{quietText}</span></span>
      <Switch on={alerts.quiet} label="Hold alerts overnight" onchange={(v) => alerts.setQuiet(v)} />
    </div>
  </section>

  {#if alerts.pushState === 'install'}
    <p class="rise note" style="--d:.16s">On iPhone, notifications work once Ibriz is on your Home Screen. <a href={href('onbinstall')}>How to add it</a>. Until then alerts show inside the app.</p>
  {:else if alerts.pushState === 'unsupported'}
    <p class="rise note" style="--d:.16s">This browser cannot show notifications, so alerts show inside the app.</p>
  {:else if alerts.pushState === 'denied'}
    <p class="rise note" style="--d:.16s">Notifications are blocked for Ibriz. Allow them in your browser settings; until then alerts show inside the app.</p>
  {/if}

  <p class="rise priv" style="--d:.2s">
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true"><rect x="1.5" y="6" width="9" height="7" rx="1.5" stroke="var(--ink-3)"/><path d="M3.5 6V4a2.5 2.5 0 0 1 5 0v2" stroke="var(--ink-3)"/></svg>
    <span>An alert holds only a price, never what you own.</span>
  </p>
  <a href={href('notifications')} class="rise how" style="--d:.24s">How alerts arrive</a>
</Screen>

<style>
  .top { display: flex; align-items: center; justify-content: space-between; height: 44px; }
  .l, .r { display: flex; align-items: center; }
  .back { width: 44px; height: 44px; margin-left: -12px; display: flex; align-items: center; justify-content: center; }
  h1 { font-size: 30px; letter-spacing: -0.01em; }
  .plus { width: 44px; height: 44px; display: flex; align-items: center; justify-content: flex-end; }
  .empty { margin-top: 28px; font-size: 15px; line-height: 1.55; color: var(--ink-2); }
  .list { margin-top: 18px; }
  .row { gap: 14px; min-height: 64px; }
  .t { display: flex; flex-direction: column; gap: 3px; font-size: 15px; }
  .s { font-size: 13px; color: var(--ink-3); }
  .rm { height: 44px; padding: 0 4px; font-size: 14px; color: var(--down); }
  .edit { height: 44px; margin-top: 4px; font-size: 14px; color: var(--gold-text); }
  section { margin-top: 28px; }
  section h2 { margin-bottom: 4px; }
  .note { margin-top: 18px; font-size: 13px; line-height: 1.5; color: var(--ink-2); }
  .note a { color: var(--gold-text); text-decoration: underline; text-underline-offset: 3px; }
  .priv { margin-top: 24px; display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ink-3); }
  .how { display: inline-flex; align-items: center; height: 44px; margin-top: 4px; font-size: 14px; color: var(--gold-text); }
</style>
