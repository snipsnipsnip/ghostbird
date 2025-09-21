export class GhostbirdOptionsElement extends HTMLElement {
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
