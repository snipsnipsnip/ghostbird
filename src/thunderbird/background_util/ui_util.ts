import type { IUiUtil } from "src/app-background"

export class UiUtil implements IUiUtil {
  static isSingleton = true

  constructor(private readonly messenger: typeof globalThis.messenger) {}

  openOptionsPage(): Promise<void> {
    return this.messenger.runtime.openOptionsPage()
  }
}
