import type { IOptionsStore } from "src/app-options"
import * as appOptions from "src/app-options"
import type { WirelessInjector } from "src/root/util"
import { makeRegistry } from "src/root/util/registry"
import { wireless } from "src/root/util/wireless"
import * as thunderbirdOptions from "src/thunderbird/options_util"

export type OptionsConstants = object

export type OptionsCatalog = OptionsConstants & {
  optionsStore: IOptionsStore
}

/** Collects related classes and prepares the injector for options.js */
export const startupOptions = (consts: OptionsConstants): WirelessInjector<OptionsCatalog> =>
  wireless([thunderbirdOptions, appOptions], makeRegistry(consts as OptionsCatalog))
