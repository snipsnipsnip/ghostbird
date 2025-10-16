import type { IComposeWindow } from "src/ghosttext-adaptor"
import type { CommandHandler, CommandId, IButtonMenu, MenuItem, MenuShownInfo } from "."

/** Responsible for handling the context menu on the toolbar button */
export class MenuHandler {
  static isSingleton = true

  constructor(
    private readonly buttonMenu: IButtonMenu,
    private readonly commandHandler: CommandHandler,
    private readonly menuItems: ReadonlyArray<MenuItem>,
  ) {}

  /** Handles right-click on the toolbar button */
  handleMenuShown(info: MenuShownInfo): Promise<void> | void {
    // Compare the shown menu with menuItems and (re-)initialize the menu if necessary
    console.debug(info)

    if (!this.buttonMenu.isInitialized()) {
      console.debug("Initializing menu")
      return this.buttonMenu.initItems(this.menuItems, info)
    }

    console.debug("Menu is already initialized")
  }

  /** Handles click on a menu item */
  handleMenuItemClicked(menuItemId: string, composeTab: IComposeWindow): Promise<void> {
    // We use command ID as menu item ID, so we can directly pass it to the command handler
    return this.commandHandler.runCommand(menuItemId as CommandId, composeTab)
  }
}
