import type { GhostbirdOptionsElement } from "."

export class OptionsEventRouter {
  static isSingleton = true

  constructor() {}

  initOptions(_elem: GhostbirdOptionsElement): Promise<void> {
    return Promise.resolve()
  }
}
