/** @file Entrypoint of the options page */

import { GhostbirdOptionsElement } from "src/app-options/ghostbird_options_element"
import { OptionsEventRouter } from "src/app-options/options_event_router"
import { startupOptions } from "./startup/startup_options"

function prepareRouter(): OptionsEventRouter {
  const startup = startupOptions({})
  return startup(OptionsEventRouter)
}

console.log("starting", import.meta.url)

customElements.whenDefined("ghostbird-options").then(async () => {
  const router = prepareRouter()
  let [opt] = document.getElementsByTagName("ghostbird-options")
  if (!opt) {
    throw Error("unexpected html state")
  }
  await router.initOptions(opt as GhostbirdOptionsElement)
})

customElements.define("ghostbird-options", GhostbirdOptionsElement)

console.log("started", import.meta.url)
