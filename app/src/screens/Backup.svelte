<script lang="ts">
  import MyGold from './MyGold.svelte'
  import Sheet from '../components/Sheet.svelte'
  import { holdings } from '../lib/holdings.svelte'
  import { downloadText, isEncrypted, lastBackup, makeBackup, markBackedUp, readBackup } from '../lib/backup'
  import { toast } from '../lib/toast.svelte'
  import { longDate } from '../lib/mygold-bits'

  let protect = $state(true)
  let pass = $state('')
  let last = $state(lastBackup())
  let error = $state('')
  let restoreText = $state<string | null>(null)
  let restorePass = $state('')

  async function save() {
    error = ''
    if (!holdings.pieces.length) { error = 'There is nothing to back up yet.'; return }
    if (protect && pass.length < 4) { error = 'Use a passphrase of at least 4 characters, or switch protection off.'; return }
    const text = await makeBackup($state.snapshot(holdings.pieces) as any, protect ? pass : undefined)
    downloadText(`ibriz-my-gold-${new Date().toISOString().slice(0, 10)}.json`, text)
    markBackedUp(); last = lastBackup()
    toast.show('Backup file saved')
  }
  async function pickFile(e: Event) {
    error = ''
    const f = (e.currentTarget as HTMLInputElement).files?.[0]
    if (!f) return
    restoreText = await f.text()
    restorePass = ''
    if (!isEncrypted(restoreText)) await restore()
  }
  async function restore() {
    try {
      const incoming = await readBackup(restoreText!, restorePass || undefined)
      const byId = new Map(holdings.pieces.map((p) => [p.id, p]))
      for (const p of incoming) byId.set(p.id, p)
      await holdings.replaceAll([...byId.values()])
      toast.show(`Restored ${incoming.length} piece${incoming.length === 1 ? '' : 's'}`)
      restoreText = null
    } catch (err) {
      error = (err as Error).message
    }
  }
</script>

<MyGold />
<Sheet label="Back up My Gold" top={180}>
  <div class="head"><p class="label">My Gold</p><h1 class="serif">Back up your pieces</h1></div>
  <p class="body">Your pieces live only on this phone. A backup file keeps them safe if you change or lose it.</p>

  <div class="list">
    <div class="row"><span>Last backup</span><span class="ink3">{last ? longDate(last) : 'Never'}</span></div>
    <div class="row"><span id="pl">Protect with a passphrase</span>
      <button type="button" role="switch" aria-checked={protect} aria-labelledby="pl" class="sw" class:on={protect} onclick={() => (protect = !protect)}><i></i></button></div>
    {#if protect}
      <div class="pp"><label class="label" for="pp">Passphrase</label><input id="pp" type="password" autocomplete="new-password" bind:value={pass} /></div>
    {/if}
  </div>
  {#if protect}<p class="help">You will need it to restore. Ibriz cannot recover it, and never sees the file.</p>{/if}

  {#if error}<p class="err" role="alert">{error}</p>{/if}

  {#if restoreText && isEncrypted(restoreText)}
    <div class="pp"><label class="label" for="rp">Passphrase for this file</label><input id="rp" type="password" bind:value={restorePass} /></div>
    <button type="button" class="btn primary" style="margin-top:14px" onclick={restore}>Restore</button>
  {:else}
    <div class="acts">
      <button type="button" class="btn primary" onclick={save}>Save backup file</button>
      <label class="btn secondary pick">Restore from a file<input type="file" accept="application/json,.json" hidden onchange={pickFile} /></label>
    </div>
  {/if}
</Sheet>

<style>
  .head { margin-top: 18px; }
  h1 { font-size: 28px; margin-top: 6px; }
  .body { margin-top: 12px; font-size: 15px; line-height: 1.55; color: var(--ink-2); }
  .list { margin-top: 16px; }
  .ink3 { color: var(--ink-3); font-size: 14px; }
  .sw { width: 46px; height: 28px; border-radius: 14px; background: var(--raised); border: 1px solid var(--line); position: relative; }
  .sw i { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: var(--ink-3); transition: transform .3s var(--ease), background .3s; }
  .sw.on { background: var(--gold); border-color: var(--gold); }
  .sw.on i { transform: translateX(18px); background: var(--on-gold); }
  .pp { display: flex; flex-direction: column; gap: 6px; margin-top: 14px; }
  .pp input { height: 44px; background: none; border: 0; border-bottom: 1px solid var(--gold); font-size: 17px; outline: 0; color: var(--ink); }
  .help { margin-top: 10px; font-size: 13px; color: var(--ink-3); line-height: 1.5; }
  .err { margin-top: 12px; font-size: 14px; color: var(--down); }
  .acts { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
  .pick { cursor: pointer; }
</style>
