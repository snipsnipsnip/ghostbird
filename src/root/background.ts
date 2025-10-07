/**
 * @file Entrypoint of the background script.
 * This script may be suspended and reloaded occasionally by Thunderbird.
 */

import type { BackgroundEventRouter } from "src/app-background"
import { type LazyThen, makeLazyThen } from "src/util/lazy_then"

console.info("starting", import.meta.url)

const prepareThen: LazyThen<BackgroundEventRouter> = makeLazyThen(async () => {
  let { prepareBackgroundRouter } = await import("./startup/startup_background")

  return prepareBackgroundRouter()
})

messenger.composeAction.onClicked.addListener((tab, _info): Promise<void> | void =>
  prepareThen((router) => router.handleComposeAction(tab)),
)

messenger.commands.onCommand.addListener((command, tab): Promise<void> | void =>
  prepareThen((router) => {
    let p = router.handleCommand(command, tab)

    return p ?? Promise.reject(Error(`unknown command ${command}`))
  }),
)

messenger.runtime.onMessage.addListener((msg, sender, sendResponse): Promise<void> | undefined =>
  prepareThen((router) => {
    console.debug({ msg, sender })
    sendResponse(router.handleMessage(msg, sender.tab))
    return undefined
  }),
)

messenger.alarms.onAlarm.addListener((alarm) => {
  console.debug("beep", alarm)
})

console.info("started", import.meta.url)
