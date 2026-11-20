<script lang="ts">
  import MyGold from './MyGold.svelte'
  import Sheet from '../components/Sheet.svelte'
  import Chip from '../components/Chip.svelte'
  import Money from '../components/Money.svelte'
  import { draft, formLabels } from '../lib/draft.svelte'
  import { holdings, type Form } from '../lib/holdings.svelte'
  import { rate } from '../lib/rate.svelte'
  import { router } from '../lib/router.svelte'
  import { toast } from '../lib/toast.svelte'

  const forms = Object.keys(formLabels) as Form[]
  const valid = $derived(draft.netG > 0)
  const editing = $derived(draft.editingId !== null)

  async function save() {
    if (!valid) return
    if (draft.editingId) {
      await holdings.update(draft.editingId, draft.toPiece())
      toast.show('Saved on this phone')
      router.go('piecedetail', draft.editingId)
    } else {
      await holdings.add(draft.toPiece())
      toast.show('Added. Kept only on this phone.')
      router.go('mygold')
    }
  }
  function details() { router.go('adddetails') }
</script>

<MyGold />
<Sheet label="Add a piece" top={96}>
  <div class="head">
    <div><p class="label">Step 1 of 2</p><h1 class="serif">{editing ? 'Edit piece' : 'Add a piece'}</h1></div>
    <button type="button" class="x" aria-label="Close" onclick={() => router.back('mygold')}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 1l12 12M13 1 1 13" stroke="var(--ink-2)" stroke-width="1.4" stroke-linecap="round"/></svg>
    </button>
  </div>

  <div class="grp"><p class="label">What is it</p>
    <div role="radiogroup" aria-label="Form" class="chips">
      {#each forms as f}<Chip label={formLabels[f]} on={draft.form === f} onclick={() => (draft.form = f)} />{/each}
    </div>
  </div>
  <div class="grp"><p class="label">Purity</p>
    <div role="radiogroup" aria-label="Purity" class="chips">
      {#each rate.config.karats as k}<Chip label={k + 'K'} mono on={draft.karat === k} onclick={() => (draft.karat = k)} />{/each}
    </div>
  </div>
  <div class="grp"><label class="label" for="weight">Weight</label>
    <div class="inp"><input id="weight" class="serif" inputmode="decimal" placeholder="0" autocomplete="off" bind:value={draft.weight} /><span>grams</span></div>
    <p class="help">Net gold weight. Leave out stones and beads.</p>
  </div>

  <div class="row worth"><span class="ink3">Worth today</span><Money value={Math.round(draft.worthToday)} size={17} /></div>
  <div class="acts">
    <button type="button" class="btn primary" disabled={!valid} onclick={save}>{editing ? 'Save changes' : 'Add piece'}</button>
    <button type="button" class="more" disabled={!valid} onclick={details}>{editing ? 'Edit details' : 'Add details first'}</button>
  </div>
</Sheet>

<style>
  .head { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 18px; }
  h1 { font-size: 28px; margin-top: 6px; }
  .x { width: 44px; height: 44px; display: flex; align-items: center; justify-content: flex-end; }
  .grp { margin-top: 20px; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
  .inp { display: flex; align-items: baseline; gap: 12px; border-bottom: 1px solid var(--gold); margin-top: 6px; padding-bottom: 4px; }
  .inp input { flex: 1; min-width: 0; background: none; border: 0; outline: 0; font-size: 44px; letter-spacing: -0.01em; padding: 0; }
  .inp span { color: var(--ink-2); font-size: 14px; }
  .help { margin-top: 8px; font-size: 13px; color: var(--ink-3); }
  .worth { margin-top: 22px; border-bottom: 0; }
  .ink3 { color: var(--ink-3); font-size: 14px; }
  .acts { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; }
  .more { height: 44px; font-size: 14px; color: var(--gold-text); }
  .more:disabled { opacity: .4; }
</style>
