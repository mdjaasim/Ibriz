<script lang="ts">
  import { onMount } from 'svelte'
  import { router } from './lib/router.svelte'
  import { rate } from './lib/rate.svelte'
  import { holdings } from './lib/holdings.svelte'
  import { settings } from './lib/settings.svelte'
  import Toast from './components/Toast.svelte'

  // Every file in screens/ is a route. The route id is the lowercased file name
  // (Main.svelte -> #/main, RateSheet.svelte -> #/ratesheet), as in design/DESIGN.md section 7.
  const modules = import.meta.glob('./screens/*.svelte', { eager: true }) as Record<string, { default: any }>
  const screens: Record<string, any> = {}
  for (const [path, mod] of Object.entries(modules)) {
    const name = path.replace('./screens/', '').replace('.svelte', '').toLowerCase()
    screens[name] = mod.default
  }

  const Current = $derived(screens[router.route.id === 'today' ? 'main' : router.route.id] ?? screens['main'])

  // Play the intro animation once: on the first Today. Any later navigation (tab switch, back) is still.
  let seenToday = false
  $effect(() => {
    const id = router.route.id
    if (document.documentElement.dataset.still) return
    if (id === 'welcome' || id.startsWith('onb') || !settings.data.onboarded) return
    if (!seenToday) {
      if (id === 'main' || id === 'today') {
        seenToday = true
        setTimeout(() => (document.documentElement.dataset.still = '1'), 4000)
      }
      return
    }
    document.documentElement.dataset.still = '1'
  })

  onMount(() => {
    rate.start()
    holdings.init()
    if (!settings.data.onboarded && !location.hash) router.go('welcome')
  })
</script>

{#key router.route.id}
  <Current param={router.route.param} />
{/key}
<Toast />
