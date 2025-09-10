/**
 * @file content script injected into a compose window.
 */

// Content scripts currently can't be a ES module.
// So all the imports here will be bundled into one file.

import * as compose from "../app-compose"
import * as thunderbird from "../thunderbird/compose_util"
import { PromisifiedPort } from "../thunderbird/util/promisified_port"
import { startup } from "./startup"
import { makeRegistry } from "./util/registry"

class Root {
  constructor(readonly composeEventRouter: compose.ComposeEventRouter) {}

  init(): compose.ComposeEventRouter {
    return this.composeEventRouter
  }
}

console.info("starting compose.js")
console.debug({ document })

const wire = startup([thunderbird, compose], makeRegistry<Root>())
const root = wire(Root)
const composeEventRouter = root.init()

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
