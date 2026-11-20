<script lang="ts">
  import Alerts from './Alerts.svelte'
  import Sheet from '../components/Sheet.svelte'
  import Chip from '../components/Chip.svelte'
  import { alerts, type AlertKind, type Channel } from '../lib/alerts.svelte'
  import { rate } from '../lib/rate.svelte'
  import { settings } from '../lib/settings.svelte'
  import { holdings } from '../lib/holdings.svelte'
  import { toast } from '../lib/toast.svelte'
  import { indian, parseNumberSafe } from '../lib/alerts-form'

  type Type = 'price' | 'move' | 'breakeven'
  let type = $state<Type>('price')
  let karat = $state(settings.data.karat)
  let direction = $state<'above' | 'below'>('below')
  const today = $derived(rate.perGram(karat))
  // start two percent away from today, rounded to a round number
  const suggested = $derived(Math.round((today * (direction === 'below' ? 0.98 : 1.02)) / 10) * 10)
  let targetText = $state('')
  let movePct = $state(1.5)
  let pieceId = $state<string | undefined>(undefined)
  const pieces = $derived(holdings.pieces.filter((p) => p.totalPaid && p.netG > 0))
  let channel = $state<Channel>('push')
  let error = $state('')

  const pushOk = $derived(alerts.pushState === 'ok' && !!rate.config.vapidPublic)
  $effect(() => { if (!pushOk || type === 'breakeven') channel = 'app'; else if (channel === 'app' && alerts.pushState === 'ok') channel = 'push' })
  $effect(() => { if (type === 'price') targetText = indian(suggested) })
  $effect(() => { if (type === 'breakeven' && !pieceId && pieces[0]) pieceId = pieces[0].id })

  const target = $derived(parseNumberSafe(targetText))
  const away = $derived(target && today ? (Math.abs(target - today) / today) * 100 : null)
  const valid = $derived(type === 'price' ? target > 0 : type === 'move' ? movePct > 0 : !!pieceId)

  async function save() {
    error = ''
    try {
      const kind: AlertKind = type
      await alerts.add({
        kind,
        karat: type === 'breakeven' ? (pieces.find((p) => p.id === pieceId)?.karat ?? karat) : karat,
        direction: type === 'price' ? direction : undefined,
        target: type === 'price' ? target : type === 'move' ? movePct : undefined,
        pieceId: type === 'breakeven' ? pieceId : undefined,
        channel,
      })
      toast.show('Alert saved')
      location.replace('#/alerts') // replace, so Back does not return to the form
    } catch (e) {
      error = (e as Error).message
    }
  }
</script>

<Alerts />
<Sheet label="New alert" top={110}>
  <div class="head"><h1 class="serif">New alert</h1><button type="button" aria-label="Close" onclick={() => location.replace('#/alerts')}>
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 1l12 12M13 1 1 13" stroke="var(--ink-2)" stroke-width="1.4" stroke-linecap="round"/></svg></button></div>

  <div role="radiogroup" aria-label="Alert type" class="chips">
    <Chip on={type === 'price'} label="Price" onclick={() => (type = 'price')} />
    <Chip on={type === 'move'} label="Daily move" onclick={() => (type = 'move')} />
    <Chip on={type === 'breakeven'} label="Break-even" onclick={() => (type = 'breakeven')} />
  </div>

  {#if type !== 'breakeven'}
    <div role="radiogroup" aria-label="Purity" class="karats">
      {#each rate.config.karats as k}<button type="button" role="radio" aria-checked={karat === k} class="k mono" class:on={karat === k} onclick={() => (karat = k)}>{k}K</button>{/each}
    </div>
  {/if}

  {#if type === 'price'}
    <p class="when">When <span class="mono">{karat}K</span> goes
      <button type="button" class="dir" onclick={() => (direction = direction === 'below' ? 'above' : 'below')} aria-label="Direction, now {direction}. Tap to change">{direction}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="var(--gold-text)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></button></p>
    <div class="field">
      <label class="label" for="target">Target rate per gram</label>
      <div class="inp"><span class="rs">₹</span><input id="target" class="serif" inputmode="numeric" bind:value={targetText} autocomplete="off" /><span class="unit">a gram</span></div>
    </div>
    <p class="away">Today <span class="mono">₹{indian(Math.round(today))}</span>{#if away !== null} · <span class="mono">{away.toFixed(1)}%</span> away{/if}</p>
  {:else if type === 'move'}
    <p class="when">When the price moves by</p>
    <div class="field">
      <label class="label" for="pct">Percent in a day, up or down</label>
      <div class="inp">
        <button type="button" class="step" aria-label="Less" onclick={() => (movePct = Math.max(0.5, +(movePct - 0.5).toFixed(1)))}>−</button>
        <input id="pct" class="serif" inputmode="decimal" value={movePct} oninput={(e) => { const n = parseNumberSafe((e.currentTarget as HTMLInputElement).value); if (n > 0) movePct = n }} />
        <span class="unit">%</span>
        <button type="button" class="step" aria-label="More" onclick={() => (movePct = +(movePct + 0.5).toFixed(1))}>+</button>
      </div>
    </div>
    <p class="away">Most days gold moves less than this, so you will hear about the bigger ones.</p>
  {:else}
    {#if pieces.length === 0}
      <p class="away">Add what you paid to a piece in My Gold first, then Ibriz can tell you when the rate reaches it.</p>
    {:else}
      <p class="when">Tell me when this piece gets back what you paid</p>
      <div role="radiogroup" aria-label="Piece" class="pieces">
        {#each pieces as p}
          <button type="button" role="radio" aria-checked={pieceId === p.id} class="row" onclick={() => (pieceId = p.id)}>
            <span class="t"><span>{p.name}</span><span class="s mono">{p.karat}K · at ₹{indian(Math.round(p.totalPaid! / p.netG))} a gram</span></span><i class:on={pieceId === p.id}></i>
          </button>
        {/each}
      </div>
    {/if}
  {/if}

  <div role="radiogroup" aria-label="How to tell you" class="how">
    <button type="button" role="radio" aria-checked={channel === 'push'} class="row" disabled={!pushOk || type === 'breakeven'} onclick={() => (channel = 'push')}>
      <span class="t"><span>Notification</span><span class="s">{type === 'breakeven' ? 'Break-even uses your pieces, so it stays on this phone' : pushOk ? 'Works when Ibriz is closed' : alerts.pushState === 'install' ? 'On iPhone, add Ibriz to your Home Screen first' : 'Not available in this browser'}</span></span><i class:on={channel === 'push'}></i>
    </button>
    <button type="button" role="radio" aria-checked={channel === 'app'} class="row" onclick={() => (channel = 'app')}>
      <span class="t"><span>In the app only</span><span class="s">Nothing leaves this phone</span></span><i class:on={channel === 'app'}></i>
    </button>
  </div>

  {#if error}<p class="err" role="alert">{error}</p>{/if}
  <button type="button" class="btn primary save" disabled={!valid || alerts.busy} onclick={save}>{alerts.busy ? 'Saving…' : 'Save alert'}</button>
</Sheet>

<style>
  .head { display: flex; align-items: center; justify-content: space-between; margin: 18px 0 12px; }
  h1 { font-size: 26px; }
  .head button { width: 44px; height: 44px; display: flex; align-items: center; justify-content: flex-end; }
  .chips { display: flex; gap: 8px; flex-wrap: wrap; }
  .karats { display: flex; gap: 6px; margin-top: 12px; }
  .k { height: 36px; min-width: 52px; border: 1px solid var(--line); border-radius: 18px; font-size: 13px; color: var(--ink-2); }
  .k.on { color: var(--ink); background: var(--raised); border-color: color-mix(in srgb, var(--gold) 55%, transparent); }
  .when { margin-top: 20px; font-size: 16px; color: var(--ink-2); }
  .when .mono { color: var(--ink); }
  .dir { display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 4px; font-size: 16px; color: var(--gold-text); }
  .field { margin-top: 10px; }
  .inp { display: flex; align-items: baseline; gap: 8px; border-bottom: 1px solid var(--gold); padding: 6px 0 4px; }
  .inp input { flex: 1; min-width: 0; background: none; border: 0; outline: none; font-size: 42px; letter-spacing: -0.01em; }
  .rs { font-size: 18px; color: var(--gold-text); font-weight: 300; }
  .unit { font-size: 14px; color: var(--ink-3); }
  .step { width: 44px; height: 44px; font-size: 22px; color: var(--gold-text); align-self: center; }
  .away { margin-top: 10px; font-size: 14px; line-height: 1.5; color: var(--ink-2); }
  .away .mono { color: var(--ink); }
  .pieces, .how { margin-top: 18px; }
  .how { margin-top: 22px; }
  .row { width: 100%; text-align: left; gap: 12px; min-height: 60px; }
  .row:disabled { opacity: .5; }
  .t { display: flex; flex-direction: column; gap: 3px; font-size: 15px; }
  .s { font-size: 13px; color: var(--ink-3); }
  i { width: 6px; height: 6px; transform: rotate(45deg); flex: none; }
  i.on { background: var(--gold); }
  .err { margin-top: 12px; font-size: 13px; color: var(--down); }
  .save { margin-top: 18px; }
</style>
