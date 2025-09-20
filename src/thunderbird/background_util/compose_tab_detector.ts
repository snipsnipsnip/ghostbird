import type { IComposeWindowDetector, ITab } from "src/app-background"
import type { IComposeWindow } from "src/ghosttext-adaptor/api"
import { ComposeTab } from "./compose_tab"

export class ComposeTabDetector implements IComposeWindowDetector {
  static isSingleton = true

  constructor(readonly messenger: typeof globalThis.messenger) {}

  tryWrap(tab: ITab): IComposeWindow | undefined {
    if (tab.type !== "messageCompose") {
      console.info(`The tab is not for mail composition`, tab)
      return
    }
    if (tab.id == null) {
      console.info(`Unknown sender: ${tab.type}`)
      return
    }

    return new ComposeTab(
      tab.id,
      this.messenger.tabs,
      this.messenger.scripting,
      this.messenger.compose,
      this.messenger.composeAction,
    )
  }
}
