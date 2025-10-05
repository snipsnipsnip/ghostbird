import type { ComposeActionNotifier, IComposeWindowDetector } from "src/app-background"
import * as appBackground from "src/app-background"
import { BackgroundEventRouter } from "src/app-background"
import * as adaptor from "src/ghosttext-adaptor"
import * as runner from "src/ghosttext-runner"
import * as session from "src/ghosttext-session"
import type { WirelessInjector } from "src/root/util"
import { makeRegistry } from "src/root/util/registry"
import { wireless } from "src/root/util/wireless"
import { AlarmHeart } from "src/thunderbird"
import * as thunderbirdBackground from "src/thunderbird/background_util"

export type BackgroundConstants = {
  messenger: typeof globalThis.messenger
  heart: AlarmHeart
}

export type BackgroundCatalog = BackgroundConstants & {
  composeActionNotifier: ComposeActionNotifier
  composeTabDetector: IComposeWindowDetector
}

/** Collects related classes and prepares the injector for background.js */
export const startupBackground = (consts: BackgroundConstants): WirelessInjector<BackgroundCatalog> =>
  wireless([thunderbirdBackground, appBackground, adaptor, runner, session], makeRegistry(consts as BackgroundCatalog))

export function prepareBackgroundRouter(): BackgroundEventRouter {
  let heart = new AlarmHeart(messenger)
  let startup = startupBackground({ messenger, heart })

  // Set the ready flag that promises the alarm event handler is registered
  heart.assumeReady()

  return startup(BackgroundEventRouter)
}
