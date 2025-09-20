import * as options from "src/app-options"
import * as thunderbird from "src/thunderbird/options_util"
import { type Startup, startup } from "./startup"
import { makeRegistry } from "./util/registry"

console.log("starting", import.meta.url)

class Root {
  init(): void {}
}

class GhostbirdOptionsElement extends HTMLElement {
  connectedCallback(): void {}
}

const wire: Startup<Root> = startup([thunderbird, options], makeRegistry<Root>())
wire(Root).init()

customElements.whenDefined("ghostbird-options").then(() => {
  console.log("defined")
})

customElements.define("ghostbird-options", GhostbirdOptionsElement)
console.log("started", import.meta.url)
