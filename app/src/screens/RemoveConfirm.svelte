<script lang="ts">
  import PieceDetail from './PieceDetail.svelte'
  import Sheet from '../components/Sheet.svelte'
  import { holdings } from '../lib/holdings.svelte'
  import { router } from '../lib/router.svelte'
  import { toast } from '../lib/toast.svelte'
  let { param = '' }: { param?: string } = $props()
  const piece = $derived(holdings.pieces.find((p) => p.id === param))
  async function remove() {
    if (!piece) return
    await holdings.remove(piece.id)
    toast.show('Removed from this phone')
    router.go('mygold')
  }
</script>

<PieceDetail {param} />
<Sheet label="Remove a piece" top={420}>
  <h1 class="serif">Remove {piece?.name ?? 'this piece'}?</h1>
  <p>It will be deleted from this phone, with its bill photo. A backup file you saved earlier still has it.</p>
  <div class="acts">
    <button type="button" class="btn danger" onclick={remove}>Remove</button>
    <button type="button" class="btn secondary" onclick={() => router.back('mygold')}>Keep it</button>
  </div>
</Sheet>

<style>
  h1 { font-size: 26px; margin-top: 24px; line-height: 1.2; }
  p { margin-top: 12px; font-size: 15px; line-height: 1.55; color: var(--ink-2); }
  .acts { display: flex; flex-direction: column; gap: 10px; margin-top: 24px; }
</style>
