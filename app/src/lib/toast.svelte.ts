class Toast {
  text = $state('')
  private t: ReturnType<typeof setTimeout> | undefined
  show(text: string, ms = 2600) {
    this.text = text
    clearTimeout(this.t)
    this.t = setTimeout(() => (this.text = ''), ms)
  }
}
export const toast = new Toast()
