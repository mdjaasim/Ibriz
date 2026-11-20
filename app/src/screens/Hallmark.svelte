<script lang="ts">
  import LearnHeader from '../components/LearnHeader.svelte'
  import Screen from '../components/Screen.svelte'
  import { rate } from '../lib/rate.svelte'
  import { settings } from '../lib/settings.svelte'
  import { fineness } from '../lib/calc'
  import { bisHallmarkUrl, pureGoldFineness } from '../lib/calcconfig'

  const k = $derived(settings.data.karat)
  const stamp = $derived(`${k}K${fineness(rate.purity(k), pureGoldFineness)}`)
  const items = $derived([
    { t: 'The BIS logo is stamped', s: 'Bureau of Indian Standards' },
    { t: `Purity reads ${stamp}`, s: 'Karat and fineness together' },
    { t: 'A six-character HUID', s: 'Unique to this piece' },
  ])
  let on = $state([false, false, false])
</script>

<Screen tab="learn">
  <LearnHeader title="Check the hallmark" back="menu" />

  <div class="lens rise" style="--d:.06s" aria-hidden="true">
    <svg viewBox="0 0 260 260" width="260" height="260" fill="none">
      <circle cx="130" cy="130" r="118" fill="color-mix(in srgb, var(--gold) 5%, transparent)" stroke="var(--gold)" stroke-opacity=".55"/>
      <path d="M212 212l30 30" stroke="var(--raised)" stroke-width="14" stroke-linecap="round"/>
      <rect x="32" y="98" width="196" height="56" rx="10" fill="var(--sheet)" stroke="var(--line)"/>
      <rect x="44" y="108" width="34" height="36" rx="4" stroke="var(--gold)" stroke-dasharray="3 3" stroke-opacity=".7"/>
      <text x="61" y="130" text-anchor="middle" font-size="10" fill="var(--gold-text)" font-family="var(--font-text)">BIS</text>
      <text x="90" y="132" font-size="15" fill="var(--gold-text)" font-family="var(--font-figures)">{stamp}</text>
      <text x="164" y="132" font-size="15" fill="var(--gold-text)" font-family="var(--font-figures)">7K3P9Q</text>
    </svg>
  </div>

  <p class="rise intro" style="--d:.12s">Every hallmarked piece carries three small marks. Check them before you pay.</p>

  <div role="group" aria-label="Hallmark checklist" class="list">
    {#each items as it, i}
      <button type="button" role="checkbox" aria-checked={on[i]} class="item rise" style="--d:{0.18 + i * 0.06}s" onclick={() => (on[i] = !on[i])}>
        <i class="box" class:on={on[i]} aria-hidden="true">
          {#if on[i]}<svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1.5" stroke="var(--on-gold)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>{/if}
        </i>
        <span class="tx"><span class="t1">{it.t}</span><span class="t2">{it.s}</span></span>
      </button>
    {/each}
  </div>

  <div class="foot rise" style="--d:.4s">
    <a class="btn secondary" href={bisHallmarkUrl} target="_blank" rel="noopener noreferrer" style="color:var(--gold-text)">Verify HUID in BIS Care
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style="margin-left:8px"><path d="M3 9l6-6M4 3h5v5" stroke="var(--gold-text)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </a>
  </div>
</Screen>

<style>
  .lens { display: flex; justify-content: center; margin-top: 20px; }
  .intro { text-align: center; color: var(--ink-2); font-size: 16px; line-height: 1.55; margin-top: 18px; text-wrap: balance; }
  .list { margin-top: 18px; }
  .item { display: flex; align-items: center; gap: 16px; width: 100%; min-height: 68px; text-align: left; border-top: 1px solid var(--line); }
  .item:last-child { border-bottom: 1px solid var(--line); }
  .box { width: 24px; height: 24px; border-radius: 7px; border: 1px solid var(--line); display: flex; align-items: center; justify-content: center; flex: none; }
  .box.on { background: var(--gold); border-color: var(--gold); }
  .tx { display: flex; flex-direction: column; gap: 3px; }
  .t1 { font-size: 17px; }
  .t2 { font-size: 14px; color: var(--ink-3); }
  .foot { margin-top: 36px; }
</style>
