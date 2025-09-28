import type { GhostbirdOptionsElement, IOptionsStore } from "."

export class OptionsEventRouter {
  static isSingleton = true

  constructor(readonly optionsStore: IOptionsStore) {}

  initOptions(elem: GhostbirdOptionsElement): Promise<void> {
    return elem.startSync(this.optionsStore)
  }
}
