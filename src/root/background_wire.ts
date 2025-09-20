import type { BackgroundEventRouter } from "src/app-background"
import * as background from "src/app-background"
import * as adaptor from "src/ghosttext-adaptor"
import * as runner from "src/ghosttext-runner"
import * as session from "src/ghosttext-session"
import * as thunderbird from "src/thunderbird/background_util"
import type { AlarmHeart } from "src/thunderbird/background_util/alarm_heart"
import { type Startup, startup } from "./startup"
import { makeRegistry } from "./util/registry"

class Root {
  constructor(
    readonly backgroundEventRouter: BackgroundEventRouter,
    readonly heart: AlarmHeart,
  ) {}

  init(): BackgroundEventRouter {
    this.heart.assumeReady()

    return this.backgroundEventRouter
  }
}

export const backgroundWire = (): Startup<Root> =>
  startup([thunderbird, background, adaptor, runner, session], makeRegistry<Root>())

export function prepareBackgroundRouter(): BackgroundEventRouter {
  let wire = backgroundWire()
  let root = wire(Root)

  return root.init()
}
