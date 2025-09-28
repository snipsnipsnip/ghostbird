import type { IOptionsStore } from "."

export class GhostbirdOptionsElement extends HTMLElement {
  get optionForm(): HTMLFormElement {
    return this.$("form")
  }

  get progress(): HTMLElement {
    return this.$(".progress")
  }

  async startSync(optionsStore: IOptionsStore): Promise<never> {
    let q = await optionsStore.syncForm(this.optionForm)

    let progress = this.progress
    for (;;) {
      await q.waitReady()

      progress.classList.remove("saved", "error")

      // Yield to separate tasks for removing and adding of the class
      await Promise.resolve()

      let msg = q.dequeueReceived()
      switch (msg) {
        case "saved":
          progress.classList.add("saved")
          break
        case "error":
          progress.classList.add("error")
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
