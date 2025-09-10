import type { BackgroundEventRouter } from "../app-background"
import * as background from "../app-background"
import * as adaptor from "../ghosttext-adaptor"
import * as runner from "../ghosttext-runner"
import * as session from "../ghosttext-session"
import * as thunderbird from "../thunderbird/background_util"
import type { AlarmHeart } from "../thunderbird/background_util/alarm_heart"
import { startup } from "./startup"
import { makeRegistry } from "./util/registry"

class Root {
  constructor(
    readonly backgroundEventRouter: BackgroundEventRouter,
    readonly heart: AlarmHeart,
  ) {}

  init() {
    this.heart.assumeReady()

    return this.backgroundEventRouter
  }
}

export const backgroundWire = <TRoot>() =>
  startup([thunderbird, background, adaptor, runner, session], makeRegistry<TRoot>())

export function prepareBackgroundRouter(): BackgroundEventRouter {
  let wire = backgroundWire<Root>()
  let root = wire(Root)

  return root.init()
}
