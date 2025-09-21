import type { IBackgroundMessenger } from "src/app-compose"
import * as appCompose from "src/app-compose"
import type { WirelessInjector } from "src/root/util"
import { makeRegistry } from "src/root/util/registry"
import { wireless } from "src/root/util/wireless"
import * as thunderbirdCompose from "src/thunderbird/compose_util"

export type ComposeConstants = {
  messenger: typeof messenger
  body: HTMLElement
}

export type ComposeCatalog = ComposeConstants & {
  backgroundMessenger: IBackgroundMessenger
}

/** Collects related classes and prepares the injector for compose.js */
export const startupCompose = (consts: ComposeConstants): WirelessInjector<ComposeCatalog> =>
  wireless([thunderbirdCompose, appCompose], makeRegistry(consts as ComposeCatalog))
