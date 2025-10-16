import type { MenuHandler, MenuShownInfo } from "."
import type { CommandId, IComposeWindowDetector, ITab } from "./api"
import type { CommandHandler } from "./command_handler"

/** Redirects events from Thunderbird to the appropriate handlers */
export class BackgroundEventRouter {
  static isSingleton = true

  constructor(
    private readonly composeTabDetector: IComposeWindowDetector,
    private readonly commandHandler: CommandHandler,
    private readonly menuHandler: MenuHandler,
  ) {}

  /** Handles shortcut key presses defined in the manifest.json */
  handleCommand(command: string, tab: ITab): Promise<void> {
    let composeTab = this.composeTabDetector.tryWrap(tab)
    if (!composeTab) {
      return Promise.reject(Error("Event dropped"))
    }

    return this.commandHandler.runCommand(command as CommandId, composeTab)
  }

  /** Handles the toolbar button press */
  handleComposeAction(tab: ITab): Promise<void> {
    console.log("handleComposeAction")

    let composeTab = this.composeTabDetector.tryWrap(tab)
    if (!composeTab) {
      return Promise.reject(Error("Event dropped"))
    }

    return this.commandHandler.runCommand("start_ghostbird", composeTab)
  }

  /** Handles right-click on the toolbar button */
  handleMenuShown(info: MenuShownInfo, _tab: ITab): void | Promise<void> {
    return this.menuHandler.handleMenuShown(info)
  }

  /** Handles clicks on the item in the toolbar button's context menu */
  handleMenuClick(menuItemId: string, tab: ITab): Promise<void> {
    let composeTab = this.composeTabDetector.tryWrap(tab)
    if (!composeTab) {
      return Promise.reject(Error("Event dropped"))
    }

    return this.menuHandler.handleMenuItemClicked(menuItemId, composeTab)
  }

  /** handles one-off messages from content scripts */
  handleMessage(_msg: unknown, _tab: ITab | undefined): string {
    return "pong"
  }
}
