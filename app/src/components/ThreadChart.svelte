<script lang="ts">
  import { indian, shortDate, clockTime } from '../lib/format'
  // Gold line that draws itself, with labelled high / low / now levels and dates underneath,
  // so the chart explains itself. Dragging a finger (or the mouse) scrubs: the line after it dims.
  interface P { t: number; v: number }
  let { points, height = 170, live = true, intraday = false, onscrub }: {
    points: P[]; height?: number; live?: boolean; intraday?: boolean
    onscrub?: (p: P | null) => void
  } = $props()

  let w = $state(390)
  const padR = 62, padT = 12, padB = 24
  const min = $derived(Math.min(...points.map((p) => p.v)))
  const max = $derived(Math.max(...points.map((p) => p.v)))
  const plotW = $derived(w - padR)
  const x = (i: number) => (points.length > 1 ? (i / (points.length - 1)) * plotW : 0)
  const y = (v: number) => padT + (1 - (v - min) / (max - min || 1)) * (height - padT - padB)
  const xy = $derived(points.map((p, i) => [x(i), y(p.v)] as const))

  function curve(pts: readonly (readonly [number, number])[]): string {
    if (pts.length < 2) return ''
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2
      d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
    }
    return d
  }
  const line = $derived(curve(xy))
  const area = $derived(line && `${line} L${xy[xy.length - 1][0]} ${height - padB} L0 ${height - padB} Z`)
  const last = $derived(xy[xy.length - 1])
  const lastV = $derived(points[points.length - 1]?.v ?? 0)

  const fmtX = (t: number) => (intraday ? clockTime(t) : shortDate(t))
  const ticks = $derived(points.length > 2
    ? [
        { x: 0, anchor: 'start', text: fmtX(points[0].t) },
        { x: x(Math.floor((points.length - 1) / 2)), anchor: 'middle', text: fmtX(points[Math.floor((points.length - 1) / 2)].t) },
        { x: plotW, anchor: 'end', text: intraday ? 'Now' : 'Today' },
      ]
    : [])

  // labels on the right for high, low and now; hide one if it would collide with another
  const levels = $derived.by(() => {
    const L = [
      { v: max, cls: 'hl', text: "₹" + indian(Math.round(max)) },
      { v: min, cls: 'hl', text: "₹" + indian(Math.round(min)) },
      { v: lastV, cls: 'now', text: "₹" + indian(Math.round(lastV)) },
    ].map((l) => ({ ...l, y: y(l.v) }))
    return L.filter((l, i) => l.cls === 'now' || !L.some((o, j) => o.cls === 'now' && j !== i && Math.abs(o.y - l.y) < 13) )
  })

  let scrubIdx = $state<number | null>(null)
  function move(e: PointerEvent) {
    const r = (e.currentTarget as SVGElement).getBoundingClientRect()
    const i = Math.round(((e.clientX - r.left) / plotW) * (points.length - 1))
    scrubIdx = Math.max(0, Math.min(points.length - 1, i))
    onscrub?.(points[scrubIdx])
  }
  function end() { scrubIdx = null; onscrub?.(null) }
  const dimClip = $derived(scrubIdx === null ? 0 : xy[scrubIdx][0])
  const label = $derived(points.length > 1
    ? `Rate chart from ${indian(Math.round(points[0].v))} to ${indian(Math.round(lastV))} rupees per gram. Low ${indian(Math.round(min))}, high ${indian(Math.round(max))}.`
    : 'No chart data yet')
</script>

<div class="wrap" bind:clientWidth={w} style="height:{height}px">
  {#if points.length > 1}
    <svg width={w} {height} viewBox="0 0 {w} {height}" role="img" aria-label={label}
      onpointerdown={move} onpointermove={move} onpointerup={end} onpointerleave={end} onpointercancel={end} style="touch-action:pan-y">
      <defs>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="var(--gold)" stop-opacity="0.1"/><stop offset="1" stop-color="var(--gold)" stop-opacity="0"/>
        </linearGradient>
        <clipPath id="after"><rect x={dimClip} y="0" width={w} {height}/></clipPath>
      </defs>
      {#each levels as l}
        {#if l.cls === 'hl'}<line x1="0" x2={plotW} y1={l.y} y2={l.y} stroke="var(--ink)" stroke-opacity="0.09" stroke-dasharray="2 5"/>{/if}
        <text x={w - 2} y={l.y + 4} text-anchor="end" class="lv {l.cls}">{l.text}</text>
      {/each}
      <line x1="0" x2={plotW} y1={last[1]} y2={last[1]} stroke="var(--gold)" stroke-opacity="0.35" stroke-dasharray="2 5" class="fade"/>
      <path class="fade" d={area} fill="url(#area)"/>
      <path class="draw" pathLength="1" d={line} stroke="var(--gold)" stroke-width="1.6" fill="none" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
      {#each ticks as t}<text x={t.x} y={height - 4} text-anchor={t.anchor} class="tx">{t.text}</text>{/each}
      {#if scrubIdx !== null}
        <path d={line} stroke="var(--ground)" stroke-opacity="0.6" stroke-width="2" fill="none" clip-path="url(#after)"/>
        <line x1={xy[scrubIdx][0]} x2={xy[scrubIdx][0]} y1="0" y2={height - padB} stroke="var(--ink)" stroke-opacity="0.25"/>
        <circle cx={xy[scrubIdx][0]} cy={xy[scrubIdx][1]} r="4" fill="var(--gold)"/>
      {:else}
        {#if live}<circle cx={last[0]} cy={last[1]} r="4" fill="var(--gold)" class="pulse"/>{/if}
        <circle cx={last[0]} cy={last[1]} r="3.6" fill="var(--gold)" class="fade" style="animation-delay:2s"/>
      {/if}
    </svg>
  {:else}
    <div class="empty">Collecting prices. The line appears as readings come in.</div>
  {/if}
</div>

<style>
  .wrap { position: relative; width: 100%; user-select: none; }
  svg { display: block; overflow: visible; }
  .lv { font-family: var(--font-figures); font-size: 10.5px; fill: var(--ink-3); }
  .lv.now { fill: var(--gold-text); }
  .tx { font-family: var(--font-figures); font-size: 10.5px; fill: var(--ink-3); }
  .empty { height: 100%; display: flex; align-items: center; justify-content: center; font-size: 13px; color: var(--ink-3); text-align: center; padding: 0 24px; }
  .draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: draw var(--t-draw) var(--ease-draw) .35s forwards; }
  @keyframes draw { to { stroke-dashoffset: 0; } }
  .pulse { transform-box: fill-box; transform-origin: center; animation: pulse 2.4s var(--ease) 2s infinite; opacity: 0; }
  @keyframes pulse { 0% { transform: scale(1); opacity: .55; } 100% { transform: scale(4.2); opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .draw { animation: none; stroke-dashoffset: 0; } .pulse { animation: none; } }
</style>
