import type { BackgroundEventRouter } from "src/app-background"

console.log("starting", import.meta.url)

messenger.composeAction.onClicked.addListener((tab, _info): Promise<void> | void =>
  withRouter((router) => router.handleComposeAction(tab)),
)

messenger.commands.onCommand.addListener((command, tab): Promise<void> | void =>
  withRouter((router): Promise<void> => {
    let p = router.handleCommand(command, tab)

    return p ?? Promise.reject(Error(`unknown command ${command}`))
  }),
)

messenger.runtime.onMessage.addListener((msg, sender, sendResponse): Promise<void> | undefined =>
  withRouter((router): undefined => {
    console.log({ msg, sender })
    sendResponse(router.handleMessage(msg, sender.tab))
  }),
)

messenger.alarms.onAlarm.addListener((alarm) => {
  console.log("beep", alarm)
})

console.log("started", import.meta.url)

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
  const w = await import("./background_wire")
  router = w.prepareBackgroundRouter()

  return withRouterSync(handler, router)
}
