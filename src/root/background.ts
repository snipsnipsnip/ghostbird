/**
 * @file Entrypoint of the background script.
 * This script may be suspended and reloaded occasionally by Thunderbird.
 */

import type { BackgroundEventRouter } from "src/app-background"

let router: BackgroundEventRouter | undefined
function withRouter(handler: (r: BackgroundEventRouter) => Promise<void> | undefined): Promise<void> | undefined {
  if (router) {
    return withRouterSync(handler, router)
  } else {
    return withRouterAsync(handler)
  }
}

function withRouterSync(
  handler: (r: BackgroundEventRouter) => Promise<void> | undefined,
  router: BackgroundEventRouter,
): Promise<void> | undefined {
  try {
    return handler(router)
  } catch (error) {
    console.error({ error })
    return
  }
}

async function withRouterAsync(handler: (r: BackgroundEventRouter) => Promise<void> | undefined): Promise<void> {
  const { prepareBackgroundRouter } = await import("./startup/startup_background")
  router = prepareBackgroundRouter()

  return withRouterSync(handler, router)
}

console.log("starting", import.meta.url)

messenger.composeAction.onClicked.addListener((tab, _info): Promise<void> | void =>
  withRouter((router) => router.handleComposeAction(tab)),
)

messenger.commands.onCommand.addListener((command, tab): Promise<void> | void =>
  withRouter((router) => {
    let p = router.handleCommand(command, tab)

    return p ?? Promise.reject(Error(`unknown command ${command}`))
  }),
)

messenger.runtime.onMessage.addListener((msg, sender, sendResponse): Promise<void> | undefined =>
  withRouter((router) => {
    console.log({ msg, sender })
    sendResponse(router.handleMessage(msg, sender.tab))
    return undefined
  }),
)

messenger.alarms.onAlarm.addListener((alarm) => {
  console.log("beep", alarm)
})

console.log("started", import.meta.url)
