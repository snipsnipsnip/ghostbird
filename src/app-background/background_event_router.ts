import type { CommandId, ICommandConfig, IComposeWindowDetector, ITab } from "./api"
import type { ComposeActionNotifier } from "./compose_action_notifier"

export class BackgroundEventRouter {
  static isSingleton = true

  constructor(
    readonly composeActionNotifier: ComposeActionNotifier,
    readonly composeTabDetector: IComposeWindowDetector,
    readonly commandConfig: ICommandConfig,
  ) {}

  /** Handles shortcut key presses defined in the manifest.json */
  async handleCommand(command: string, tab: ITab): Promise<void> {
    console.log("handleCommand")

    let isToggleMode = this.isToggleMode()
    let composeTab = this.composeTabDetector.tryWrap(tab)
    if (!composeTab) {
      throw Error("Event dropped")
    }

    if (await isToggleMode) {
      return this.composeActionNotifier.toggle(composeTab)
    }

    switch (command as CommandId) {
      case "start-ghostbird":
        return this.composeActionNotifier.start(composeTab)
      case "stop-ghostbird":
        return this.composeActionNotifier.stop(composeTab)
    }
    // We don't handle default here so that tsc checks for exhaustiveness
  }

  private async isToggleMode(): Promise<boolean> {
    let config = await this.commandConfig.getAll()

    return new Set(config.map((x) => x.shortcut)).size === 1
  }

  /** Handles the toolbar button press */
  handleComposeAction(tab: ITab): Promise<void> {
    console.log("handleComposeAction")

    let composeTab = this.composeTabDetector.tryWrap(tab)
    if (!composeTab) {
      return Promise.reject(Error("Event dropped"))
    }

    return this.composeActionNotifier.start(composeTab)
  }

  /** handles one-off messages from content scripts */
  handleMessage(_msg: unknown, _tab: ITab | undefined): string {
    return "pong"
  }
}
