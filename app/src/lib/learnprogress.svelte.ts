import { load, save } from './storage'

// Which lessons were opened, and which guides the owner has ticked as reviewed.
class LearnProgress {
  read = $state<string[]>(load<string[]>('learn.read', []))
  checked = $state<string[]>(load<string[]>('learn.checked', []))

  markRead(id: string) {
    if (!this.read.includes(id)) {
      this.read.push(id)
      save('learn.read', $state.snapshot(this.read))
    }
  }
  isRead(id: string) { return this.read.includes(id) }

  toggleChecked(id: string) {
    this.checked = this.checked.includes(id) ? this.checked.filter((x) => x !== id) : [...this.checked, id]
    save('learn.checked', $state.snapshot(this.checked))
  }
  isChecked(id: string) { return this.checked.includes(id) }
}
export const progress = new LearnProgress()
