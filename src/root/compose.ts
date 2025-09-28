/**
 * @file entrypoint of the content script injected into a compose window.
 */

// Content scripts currently can't be a ES module.
// So all the imports here will be bundled into one file.

import { ComposeEventRouter } from "src/app-compose"
import { PromisifiedPort } from "src/thunderbird/util/promisified_port"
import { startupCompose } from "./startup/startup_compose"

function prepareRouter(): ComposeEventRouter {
  const selection = getSelection()
  if (!selection) {
    throw Error("Unexpected state: no selection found in the compose window")
  }
  const startup = startupCompose({
    messenger,
    body: document.body,
    selection,
    domParser: new DOMParser(),
  })
  return startup(ComposeEventRouter)
}

console.info("starting compose.js")

const composeEventRouter: ComposeEventRouter = prepareRouter()

messenger.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  try {
    sendResponse(composeEventRouter.handleMessage(message))
  } catch (e) {
    console.error({ composeOnMessage: e })
  }
  return undefined
})

messenger.runtime.onConnect.addListener(async (port) => {
  try {
    await composeEventRouter.handleConnect(PromisifiedPort.listenTo(port))
  } catch (e) {
    console.error({ composeOnConnect: e })
  } finally {
    port.disconnect()
  }
})

console.info("started compose.js")
