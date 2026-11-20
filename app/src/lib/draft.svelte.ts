import type { Form, Piece } from './holdings.svelte'
import { rate } from './rate.svelte'

// The piece being added or edited, shared by AddPiece (step 1) and AddDetails (step 2).
export const formLabels: Record<Form, string> = {
  jewellery: 'Jewellery', coin: 'Coin', bar: 'Bar', fund: 'ETF units', other: 'Other',
}

class Draft {
  editingId = $state<string | null>(null)
  form = $state<Form>('jewellery')
  karat = $state(22)
  weight = $state('') // net gold weight, grams, as typed
  stone = $state('') // stone or other weight, grams
  name = $state('')
  boughtAt = $state('') // yyyy-mm-dd
  makingPct = $state('')
  totalPaid = $state('')
  pricePerGram = $state('')
  shop = $state('')
  huid = $state('')
  billNo = $state('')
  owner = $state('')
  billPhoto = $state<string | undefined>(undefined)

  reset() {
    this.editingId = null
    this.form = 'jewellery'; this.karat = rate.config.defaultKarat
    this.weight = this.stone = this.name = this.boughtAt = this.makingPct = ''
    this.totalPaid = this.pricePerGram = this.shop = this.huid = this.billNo = this.owner = ''
    this.billPhoto = undefined
  }

  load(p: Piece & { makingPct?: number }) {
    this.editingId = p.id
    this.form = p.form; this.karat = p.karat
    this.weight = String(p.netG); this.stone = p.grossG > p.netG ? String(+(p.grossG - p.netG).toFixed(3)) : ''
    this.name = p.name; this.boughtAt = p.boughtAt ?? ''
    this.makingPct = p.makingPct !== undefined ? String(p.makingPct) : ''
    this.totalPaid = p.totalPaid !== undefined ? String(p.totalPaid) : ''
    this.pricePerGram = p.pricePerGram !== undefined ? String(p.pricePerGram) : ''
    this.shop = p.shop ?? ''; this.huid = p.huid ?? ''; this.billNo = p.billNo ?? ''; this.owner = p.owner ?? ''
    this.billPhoto = p.billPhoto
  }

  get netG() { return Math.max(0, Number(this.weight) || 0) }
  get worthToday() { return this.netG * rate.perGram(this.karat) }

  /** The piece as stored. Empty optional fields are left out. */
  toPiece(): Omit<Piece, 'id'> & { makingPct?: number } {
    const num = (s: string) => (s.trim() === '' || isNaN(Number(s)) ? undefined : Number(s))
    const stone = num(this.stone) ?? 0
    return {
      name: this.name.trim() || formLabels[this.form],
      form: this.form, karat: this.karat,
      netG: this.netG, grossG: this.netG + stone,
      boughtAt: this.boughtAt || undefined,
      shop: this.shop.trim() || undefined,
      pricePerGram: num(this.pricePerGram),
      makingPct: num(this.makingPct),
      totalPaid: num(this.totalPaid),
      huid: this.huid.trim() || undefined,
      billNo: this.billNo.trim() || undefined,
      owner: this.owner.trim() || undefined,
      billPhoto: this.billPhoto,
    }
  }
}
export const draft = new Draft()
