export class ComposeEditListener {
  static isSingleton = true

  constructor(
    private readonly body: HTMLBodyElement,
    private readonly selection: Selection,
  ) {}

  listen(): () => void {
    const body = this.body
    const selection = this.selection
    const disable = (e: Event): void => {
      e.preventDefault()
      selection.removeAllRanges()
    }
    const controller = new AbortController()
    const option = { signal: controller.signal }

    body.addEventListener("beforeinput", disable, option)
    body.addEventListener("paste", disable, option)
    body.addEventListener("cut", disable, option)
    body.addEventListener("drop", disable, option)
    body.addEventListener("dragover", disable, option)
    body.ownerDocument.addEventListener("selectionchange", disable, option)

    body.style.background = "lightgray"

    controller.signal.addEventListener("abort", () => {
      body.style.removeProperty("background")
    })

    return (): void => controller.abort()
  }
}
