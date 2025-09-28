import type { IComposeWindow } from "src/ghosttext-adaptor/api"
import type { CommandId, IComposeWindowDetector, ITab } from "./api"
import type { ComposeActionNotifier } from "./compose_action_notifier"

export class BackgroundEventRouter {
  static isSingleton = true

  constructor(
    private readonly composeActionNotifier: ComposeActionNotifier,
    private readonly composeTabDetector: IComposeWindowDetector,
  ) {}

  /** Handles shortcut key presses defined in the manifest.json */
  handleCommand(command: string, tab: ITab): Promise<void> {
    let composeTab = this.composeTabDetector.tryWrap(tab)
    if (!composeTab) {
      return Promise.reject(Error("Event dropped"))
    }

    return this.runCommand(command, composeTab)
  }

  private runCommand(command: string, composeTab: IComposeWindow): Promise<void> {
    switch (command as CommandId) {
      case "start_ghostbird":
        return this.composeActionNotifier.start(composeTab)
      case "stop_ghostbird":
        return this.composeActionNotifier.stop(composeTab)
      case "toggle_ghostbird":
        return this.composeActionNotifier.toggle(composeTab)
    }
    // We don't handle default here so that tsc checks for exhaustiveness
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
