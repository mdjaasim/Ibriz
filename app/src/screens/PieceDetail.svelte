<script lang="ts">
  import Screen from '../components/Screen.svelte'
  import BackBar from '../components/BackBar.svelte'
  import HeroNumber from '../components/HeroNumber.svelte'
  import { holdings } from '../lib/holdings.svelte'
  import { rate } from '../lib/rate.svelte'
  import { href, router } from '../lib/router.svelte'
  import { draft, formLabels } from '../lib/draft.svelte'
  import { pieceStats } from '../lib/portfolio'
  import { gainColor, gainPctText, longDate, monthYear, rupee } from '../lib/mygold-bits'
  import { indian } from '../lib/format'

  let { param = '' }: { param?: string } = $props()
  const piece = $derived(holdings.pieces.find((p) => p.id === param))
  const s = $derived(piece ? pieceStats(piece, rate.perGram(piece.karat), rate.config.defaultSellDeductionPct) : null)
  const passed = $derived(piece && s?.breakEvenRate != null ? rate.perGram(piece.karat) >= s.breakEvenRate : null)
  let bigPhoto = $state(false)
  function edit() { if (piece) { draft.load(piece); router.go('addpiece') } }
  $effect(() => { if (holdings.ready && !piece) router.go('mygold') })
</script>

<Screen glow>
  <BackBar to="mygold">
    {#snippet right()}<button type="button" class="edit" onclick={edit}>Edit</button>{/snippet}
  </BackBar>

  {#if piece && s}
    <div class="head">
      <p class="label rise">{formLabels[piece.form]} · {piece.karat}K · {+piece.netG.toFixed(2)} g</p>
      <h1 class="serif rise" style="--d:.05s">{piece.name}</h1>
      <div class="big"><span class="rs">₹</span><HeroNumber value={s.melt} size={54} /></div>
      {#if s.gain !== null}
        <p class="rise gl" style="--d:.15s">
          <span class="mono" style="color:{gainColor(s.gain)}">{s.gain < 0 ? '−' : '+'}₹{indian(Math.abs(Math.round(s.gain)))}</span>
          <span class="mono" style="color:{gainColor(s.gain)}">{gainPctText(s.gainPct)}</span>
          {#if piece.boughtAt}<span class="ink3">since {monthYear(piece.boughtAt)}</span>{/if}
        </p>
      {/if}
    </div>

    <div class="rise two" style="--d:.2s">
      <div><span class="ink3">Paid{piece.boughtAt ? ' · ' + longDate(piece.boughtAt) : ''}</span><span class="mono">{s.paid !== null ? rupee(s.paid) : '–'}</span></div>
      <div><span class="ink3">Worth today</span><span class="mono">{rupee(s.melt)}</span></div>
    </div>

    <div class="rise list" style="--d:.25s">
      <div class="row"><span>If sold today</span><span class="r"><span class="ink3">about</span><span class="mono">{rupee(s.saleEstimate)}</span></span></div>
      {#if s.breakEvenRate !== null}
        <div class="row"><span>Break-even rate</span><span class="r"><span class="mono">{rupee(s.breakEvenRate)}</span><span class="ink3">a gram</span>
          {#if passed}<span class="pass">passed</span>{/if}</span></div>
      {/if}
      {#if piece.makingPct !== undefined}<div class="row"><span>Making charges paid</span><span class="mono">{piece.makingPct}%</span></div>{/if}
      {#if piece.shop}<div class="row"><span>Shop</span><span>{piece.shop}</span></div>{/if}
      {#if piece.huid}<div class="row"><span>HUID</span><span class="r"><span class="mono">{piece.huid}</span><a href={href('hallmark')} class="ver">Verify</a></span></div>{/if}
      {#if piece.billPhoto}<div class="row"><span>Bill</span><button type="button" class="r" onclick={() => (bigPhoto = !bigPhoto)}><span>1 photo</span><img src={piece.billPhoto} alt="" class="thumb" /></button></div>{/if}
    </div>
    {#if bigPhoto && piece.billPhoto}<img src={piece.billPhoto} alt="Bill for {piece.name}" class="full" />{/if}
    <p class="rise note">If sold today is an estimate: worth today less {rate.config.defaultSellDeductionPct}% a shop typically keeps. Real offers vary.</p>

    <a href={href('removeconfirm', piece.id)} class="rise rm">Remove piece</a>
  {/if}
</Screen>

<style>
  .edit { height: 44px; font-size: 14px; color: var(--gold-text); }
  .head { margin-top: 12px; }
  h1 { font-size: 34px; margin-top: 6px; letter-spacing: -0.01em; }
  .big { display: flex; align-items: flex-start; height: 60px; margin-top: 14px; }
  .rs { font-size: 22px; font-weight: 300; color: var(--gold-text); margin: 8px 5px 0 0; }
  .gl { display: flex; gap: 10px; flex-wrap: wrap; font-size: 13px; margin-top: 8px; }
  .ink3 { color: var(--ink-3); font-size: 13px; }
  .two { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 22px; }
  .two div { display: flex; flex-direction: column; gap: 6px; padding: 12px 0; border-top: 1px solid var(--line); }
  .two .mono { font-size: 18px; }
  .list { margin-top: 12px; }
  .r { display: flex; align-items: baseline; gap: 8px; }
  .r .mono { font-size: 15px; }
  .pass { font-size: 12px; color: var(--up); }
  .ver { font-size: 13px; color: var(--gold-text); }
  .thumb { width: 28px; height: 28px; object-fit: cover; border-radius: 6px; }
  .full { width: 100%; margin-top: 12px; border-radius: 12px; }
  .note { margin-top: 12px; font-size: 12px; color: var(--ink-3); line-height: 1.5; }
  .rm { display: flex; align-items: center; justify-content: center; height: 54px; margin-top: 20px; border-radius: var(--radius-btn); color: var(--down); background: color-mix(in srgb, var(--down) 12%, transparent); font-size: 15px; }
</style>
