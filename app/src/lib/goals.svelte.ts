import { load, save } from './storage'

export interface Goal {
  id: string
  name: string
  mode: 'grams' | 'rupees'
  target: number
  karat: number
  deadline: string // YYYY-MM-DD
}

// Goals stay on this phone (localStorage). Nothing is sent anywhere.
class Goals {
  list = $state<Goal[]>(load<Goal[]>('goals', []))
  private persist() { save('goals', $state.snapshot(this.list)) }
  add(g: Omit<Goal, 'id'>) {
    this.list.push({ ...g, id: crypto.randomUUID() })
    this.persist()
  }
  remove(id: string) {
    this.list = this.list.filter((g) => g.id !== id)
    this.persist()
  }
}
export const goals = new Goals()
