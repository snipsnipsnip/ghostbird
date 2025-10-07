import type { IOptionsStore } from "."

export class GhostbirdOptionsElement extends HTMLElement {
  get optionForm(): HTMLFormElement {
    return this.$("form")
  }

  get progress(): HTMLElement {
    return this.$(".progress")
  }

  async startSync(optionsStore: IOptionsStore): Promise<never> {
    let form = this.optionForm
    let progress = this.progress
    let q = await optionsStore.syncForm(form)

    for (;;) {
      await q.waitReady()
      let msg = q.dequeueReceived()

      progress.classList.remove("saved", "error")

      // Yield to reflect the change to DOM
      await Promise.resolve()

      switch (msg) {
        case "saved":
        case "error":
          if (!form.checkValidity()) {
            // When the form is invalid, OptionsSync keeps the last valid value
            // which results in "saved". We want to show error instead
            msg = "error"
          }

          progress.classList.add(msg)
          break
        default:
          console.warn("unknown message", msg)
          break
      }
    }
  }

  private $<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K]
  private $(selectors: string): HTMLElement
  private $(selectors: string): HTMLElement {
    let e = this.querySelector<HTMLElement>(selectors)
    if (!e) {
      throw Error(`couldn't find the element [${selectors}]`)
    }
    return e
  }
}
