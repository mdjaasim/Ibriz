import { dbGet, dbSet, requestPersistence } from './db'
import { rate } from './rate.svelte'

export type Form = 'jewellery' | 'coin' | 'bar' | 'fund' | 'other'

export interface Piece {
  id: string
  name: string
  form: Form
  karat: number
  grossG: number // weight on the scale
  netG: number // gold weight after stones etc.
  boughtAt?: string // ISO date
  shop?: string
  pricePerGram?: number // rate per gram paid
  makingPct?: number // making charge as a percent of gold value
  makingPaid?: number
  gstPaid?: number
  totalPaid?: number // everything paid, rupees
  huid?: string
  billNo?: string
  billPhoto?: string // data URL, stays on the device
  owner?: string
}

class Holdings {
  pieces = $state<Piece[]>([])
  ready = $state(false)

  async init() {
    this.pieces = (await dbGet<Piece[]>('pieces')) ?? []
    this.ready = true
    if (this.pieces.length) requestPersistence()
  }

  private async persist() {
    await dbSet('pieces', $state.snapshot(this.pieces))
  }

  async add(p: Omit<Piece, 'id'>) {
    const piece: Piece = { ...p, id: crypto.randomUUID() }
    this.pieces.push(piece)
    await this.persist()
    requestPersistence()
    return piece
  }
  async update(id: string, patch: Partial<Piece>) {
    const i = this.pieces.findIndex((p) => p.id === id)
    if (i >= 0) Object.assign(this.pieces[i], patch)
    await this.persist()
  }
  async remove(id: string) {
    this.pieces = this.pieces.filter((p) => p.id !== id)
    await this.persist()
  }
  async replaceAll(pieces: Piece[]) {
    this.pieces = pieces
    await this.persist()
  }

  /** Melt value: net weight x live rate for its karat. */
  melt(p: Piece): number {
    return p.netG * rate.perGram(p.karat)
  }

  get summary() {
    const worth = this.pieces.reduce((s, p) => s + this.melt(p), 0)
    const paid = this.pieces.reduce((s, p) => s + (p.totalPaid ?? 0), 0)
    const paidKnown = this.pieces.every((p) => p.totalPaid !== undefined)
    const gain = paidKnown && paid > 0 ? worth - paid : null
    return { count: this.pieces.length, worth, paid: paidKnown ? paid : null, gain, gainPct: gain !== null && paid > 0 ? (gain / paid) * 100 : null }
  }
}

export const holdings = new Holdings()
