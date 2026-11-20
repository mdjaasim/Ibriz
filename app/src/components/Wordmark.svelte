<script lang="ts">
  let { size = 25 }: { size?: number } = $props()
</script>

<span class="serif wm" aria-label="Ibriz" style="font-size:{size}px">
  <span class="i">ı<b></b></span>br<span class="i">ı<b></b></span>z
</span>

<style>
  .wm { letter-spacing: 0.01em; line-height: 1; }
  .i { position: relative; display: inline-block; }
  .i b { position: absolute; left: 50%; top: 0.17em; width: 0.14em; height: 0.14em; background: var(--gold); transform: translateX(-50%) rotate(45deg); }
</style>
