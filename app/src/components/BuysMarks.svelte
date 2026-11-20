<script lang="ts">
  // Overlay for ThreadChart: marks the user's purchases. Uses the same geometry as ThreadChart.
  interface P { t: number; v: number }
  interface M { t: number; label: string }
  let { points, marks, height = 200 }: { points: P[]; marks: M[]; height?: number } = $props()
  let w = $state(390)
  const padR = 62, padT = 12, padB = 24
  const min = $derived(Math.min(...points.map((p) => p.v)))
  const max = $derived(Math.max(...points.map((p) => p.v)))
  const xy = (i: number, v: number) => [(i / (points.length - 1)) * (w - padR), padT + (1 - (v - min) / (max - min || 1)) * (height - padT - padB)] as const
  const placed = $derived(
    marks
      .filter((m) => points.length > 1 && m.t >= points[0].t)
      .map((m) => {
        let i = 0
        for (let k = 0; k < points.length; k++) if (Math.abs(points[k].t - m.t) < Math.abs(points[i].t - m.t)) i = k
        const [x, y] = xy(i, points[i].v)
        return { x, y, label: m.label }
      })
  )
</script>

<div class="ov" bind:clientWidth={w} style="height:{height}px" aria-hidden="true">
  <svg width={w} {height}>
    {#each placed as m}
      <line x1={m.x} x2={m.x} y1={m.y} y2={height - padB} stroke="var(--ink)" stroke-opacity=".14" stroke-dasharray="2 4"/>
      <circle cx={m.x} cy={m.y} r="4.5" fill="var(--ground)" stroke="var(--gold)" stroke-width="1.4"/>
    {/each}
  </svg>
  {#each placed as m}
    <span class="lb" style="left:{Math.min(Math.max(m.x, 30), w - 40)}px;top:{height - padB + 4}px">{m.label}</span>
  {/each}
</div>

<style>
  .ov { position: absolute; left: 0; right: 0; top: 0; pointer-events: none; }
  svg { display: block; overflow: visible; }
  .lb { position: absolute; transform: translateX(-50%); font-size: 11px; color: var(--ink-2); white-space: nowrap; }
</style>
