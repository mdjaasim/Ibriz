<script lang="ts">
  import Screen from '../components/Screen.svelte'
  import BackBar from '../components/BackBar.svelte'
  import KeptNote from '../components/KeptNote.svelte'
  import { draft } from '../lib/draft.svelte'
  import { holdings } from '../lib/holdings.svelte'
  import { rate } from '../lib/rate.svelte'
  import { href, router } from '../lib/router.svelte'
  import { toast } from '../lib/toast.svelte'
  import { shrinkImage } from '../lib/backup'
  import { indian } from '../lib/format'

  const num = (s: string) => (s.trim() === '' || isNaN(Number(s)) ? null : Number(s))
  // Suggested total from rate paid + making % + GST, using the configured GST rates.
  const suggested = $derived.by(() => {
    const price = num(draft.pricePerGram), mk = num(draft.makingPct)
    if (price === null || !draft.netG) return null
    const gold = draft.netG * price
    const making = gold * ((mk ?? 0) / 100)
    return gold + making + gold * rate.config.gstGold + making * rate.config.gstMaking
  })
  let busy = $state(false)

  async function photo(e: Event) {
    const f = (e.currentTarget as HTMLInputElement).files?.[0]
    if (!f) return
    try { draft.billPhoto = await shrinkImage(f, rate.config.billPhotoMaxPx) } catch { toast.show('Could not read that photo') }
  }
  async function save() {
    busy = true
    let id = draft.editingId
    if (id) await holdings.update(id, draft.toPiece())
    else id = (await holdings.add(draft.toPiece())).id
    toast.show('Saved on this phone')
    router.go('piecedetail', id)
  }
  const guard = $derived(draft.netG <= 0)
  $effect(() => { if (guard) router.go('addpiece') })
</script>

<Screen>
  <BackBar to="addpiece">
    {#snippet right()}<span class="label">Step 2 of 2</span>{/snippet}
  </BackBar>

  <div class="rise intro" style="--d:.05s">
    <h1 class="serif">Details</h1>
    <p>All optional. They help Ibriz show what you gained.</p>
  </div>

  <div class="rise form" style="--d:.1s">
    <div class="f"><label class="label" for="f-name">Name</label><input id="f-name" placeholder="Wedding necklace" bind:value={draft.name} /></div>
    <div class="two">
      <div class="f"><label class="label" for="f-date">Bought on</label><input id="f-date" type="date" bind:value={draft.boughtAt} max={new Date().toISOString().slice(0, 10)} /></div>
      <div class="f"><label class="label" for="f-mk">Making charges %</label><input id="f-mk" inputmode="decimal" placeholder="e.g. {rate.config.defaultMakingPct}" bind:value={draft.makingPct} /></div>
    </div>
    <div class="two">
      <div class="f"><label class="label" for="f-rate">Rate you paid, a gram</label><input id="f-rate" inputmode="decimal" placeholder="₹" bind:value={draft.pricePerGram} /></div>
      <div class="f"><label class="label" for="f-stone">Stone weight, g</label><input id="f-stone" inputmode="decimal" placeholder="0" bind:value={draft.stone} /></div>
    </div>
    <div class="f"><label class="label" for="f-paid">Total you paid</label><input id="f-paid" inputmode="decimal" placeholder="₹ everything, with making and GST" bind:value={draft.totalPaid} />
      {#if suggested !== null}
        <button type="button" class="sug" onclick={() => (draft.totalPaid = String(Math.round(suggested)))}>Estimate from the rate: ₹{indian(Math.round(suggested))}. Use it</button>
      {/if}
    </div>
    <div class="f"><label class="label" for="f-shop">Shop</label><input id="f-shop" placeholder="Shop name" bind:value={draft.shop} /></div>
    <div class="f"><label class="label" for="f-huid">HUID</label>
      <div class="with"><input id="f-huid" class="mono" autocapitalize="characters" placeholder="6 characters" bind:value={draft.huid} /><a href={href('hallmark')}>Verify</a></div>
    </div>
    <div class="two">
      <div class="f"><label class="label" for="f-bill">Bill number</label><input id="f-bill" bind:value={draft.billNo} /></div>
      <div class="f"><label class="label" for="f-own">Whose piece</label><input id="f-own" placeholder="Family member" bind:value={draft.owner} /></div>
    </div>

    {#if draft.billPhoto}
      <div class="ph"><img src={draft.billPhoto} alt="Bill" /><button type="button" onclick={() => (draft.billPhoto = undefined)}>Remove photo</button></div>
    {:else}
      <label class="photo">
        <svg width="18" height="16" viewBox="0 0 18 16" fill="none" aria-hidden="true"><rect x="1" y="3.5" width="16" height="11" rx="2" stroke="var(--gold-text)" stroke-width="1.2"/><circle cx="9" cy="9" r="3" stroke="var(--gold-text)" stroke-width="1.2"/><path d="M6 3.5 7 1.5h4l1 2" stroke="var(--gold-text)" stroke-width="1.2"/></svg>
        Add a photo of the bill
        <input type="file" accept="image/*" onchange={photo} hidden />
      </label>
    {/if}
  </div>

  <div class="rise" style="--d:.2s;margin-top:18px"><KeptNote text="Kept only on this phone, photos too" /></div>
  <div class="rise" style="--d:.25s;margin-top:18px"><button type="button" class="btn primary" disabled={busy} onclick={save}>Save piece</button></div>
</Screen>

<style>
  h1 { font-size: 36px; letter-spacing: -0.01em; }
  .intro p { margin-top: 8px; font-size: 15px; color: var(--ink-2); }
  .intro { margin-top: 8px; }
  .form { margin-top: 20px; display: flex; flex-direction: column; gap: 18px; }
  .two { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .f { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
  input:not([hidden]) { width: 100%; min-height: 44px; background: none; border: 0; border-bottom: 1px solid var(--line); padding: 0 0 6px; font-size: 17px; outline: 0; border-radius: 0; color: var(--ink); }
  input:focus { border-bottom-color: var(--gold); }
  input::placeholder { color: var(--ink-3); }
  .with { display: flex; align-items: center; gap: 12px; }
  .with a { font-size: 13px; color: var(--gold-text); height: 44px; display: flex; align-items: center; }
  .sug { text-align: left; font-size: 13px; color: var(--gold-text); min-height: 32px; }
  .photo { display: flex; align-items: center; gap: 12px; height: 54px; border: 1px dashed var(--line); border-radius: var(--radius-btn); justify-content: center; font-size: 15px; color: var(--ink-2); cursor: pointer; }
  .ph { display: flex; align-items: center; gap: 16px; }
  .ph img { width: 72px; height: 72px; object-fit: cover; border-radius: 10px; border: 1px solid var(--line); }
  .ph button { font-size: 13px; color: var(--down); height: 44px; }
</style>
