<script lang="ts">
  import { indian } from '../lib/format'
  // Full-bleed gold line that draws itself, faint fade beneath, dotted line at today's level,
  // pulsing live dot. Dragging a finger (or the mouse) scrubs: the line after it dims.
  interface P { t: number; v: number }
  let { points, height = 140, live = true, onscrub }: {
    points: P[]; height?: number; live?: boolean
    onscrub?: (p: P | null) => void
  } = $props()

  let w = $state(390)
  const padR = 24, padT = 14, padB = 18
  const min = $derived(Math.min(...points.map((p) => p.v)))
  const max = $derived(Math.max(...points.map((p) => p.v)))
  const x = (i: number) => (points.length > 1 ? (i / (points.length - 1)) * (w - padR) : 0)
  const y = (v: number) => padT + (1 - (v - min) / (max - min || 1)) * (height - padT - padB)
  const xy = $derived(points.map((p, i) => [x(i), y(p.v)] as const))

  // smooth curve through the points
  function curve(pts: readonly (readonly [number, number])[]): string {
    if (pts.length < 2) return ''
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2
      const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6
      const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6
      d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
    }
    return d
  }
  const line = $derived(curve(xy))
  const area = $derived(line && `${line} L${xy[xy.length - 1][0]} ${height} L0 ${height} Z`)
  const last = $derived(xy[xy.length - 1])
  const hiIdx = $derived(points.findIndex((p) => p.v === max))

  let scrubIdx = $state<number | null>(null)
  function move(e: PointerEvent) {
    const r = (e.currentTarget as SVGElement).getBoundingClientRect()
    const i = Math.round(((e.clientX - r.left) / (w - padR)) * (points.length - 1))
    scrubIdx = Math.max(0, Math.min(points.length - 1, i))
    onscrub?.(points[scrubIdx])
  }
  function end() { scrubIdx = null; onscrub?.(null) }
  const dimClip = $derived(scrubIdx === null ? 0 : xy[scrubIdx][0])
  const label = $derived(points.length
    ? `Rate chart from ${points[0].v ? indian(Math.round(points[0].v)) : ''} to ${indian(Math.round(points[points.length - 1].v))} rupees`
    : 'No chart data yet')
</script>

<div class="wrap" bind:clientWidth={w} style="height:{height}px">
  {#if points.length > 1}
    <svg width={w} {height} viewBox="0 0 {w} {height}" role="img" aria-label={label}
      onpointerdown={move} onpointermove={move}
      onpointerup={end} onpointerleave={end} onpointercancel={end} style="touch-action:pan-y">
      <defs>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="var(--gold)" stop-opacity="0.1"/><stop offset="1" stop-color="var(--gold)" stop-opacity="0"/>
        </linearGradient>
        <clipPath id="after"><rect x={dimClip} y="0" width={w} {height}/></clipPath>
      </defs>
      <line x1="0" x2={last[0]} y1={last[1]} y2={last[1]} stroke="var(--ink)" stroke-opacity="0.14" stroke-dasharray="2 5" class="fade"/>
      <path class="fade" d={area} fill="url(#area)"/>
      <path class="draw" pathLength="1" d={line} stroke="var(--gold)" stroke-width="1.6" fill="none" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
      {#if scrubIdx !== null}
        <path d={line} stroke="var(--ground)" stroke-opacity="0.6" stroke-width="2" fill="none" clip-path="url(#after)"/>
        <line x1={xy[scrubIdx][0]} x2={xy[scrubIdx][0]} y1="0" y2={height} stroke="var(--ink)" stroke-opacity="0.25"/>
        <circle cx={xy[scrubIdx][0]} cy={xy[scrubIdx][1]} r="4" fill="var(--gold)"/>
      {:else}
        {#if hiIdx >= 0 && hiIdx < points.length - 1}<circle cx={xy[hiIdx][0]} cy={xy[hiIdx][1]} r="2.2" fill="var(--ground)" stroke="var(--ink-2)" stroke-width="1.2" class="fade"/>{/if}
        {#if live}<circle cx={last[0]} cy={last[1]} r="4" fill="var(--gold)" class="pulse"/>{/if}
        <circle cx={last[0]} cy={last[1]} r="3.6" fill="var(--gold)" class="fade" style="animation-delay:2s"/>
      {/if}
    </svg>
  {:else}
    <div class="shimmer" style="height:2px;margin-top:{height / 2}px"></div>
  {/if}
</div>

<style>
  .wrap { position: relative; width: 100%; user-select: none; }
  svg { display: block; overflow: visible; }
  .draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: draw var(--t-draw) var(--ease-draw) .35s forwards; }
  @keyframes draw { to { stroke-dashoffset: 0; } }
  .pulse { transform-box: fill-box; transform-origin: center; animation: pulse 2.4s var(--ease) 2s infinite; opacity: 0; }
  @keyframes pulse { 0% { transform: scale(1); opacity: .55; } 100% { transform: scale(4.2); opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .draw { animation: none; stroke-dashoffset: 0; } .pulse { animation: none; } }
</style>
