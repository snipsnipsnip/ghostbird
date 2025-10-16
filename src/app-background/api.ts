import type { IComposeWindow } from "src/ghosttext-adaptor/api"
import type { MessageId } from "src/util"

export type { IGhostServerPort } from "src/ghosttext-adaptor/api"

/** IDs of shortcut keys. Must be in sync with ones in manifest.json */
export type CommandId = "start_ghostbird" | "stop_ghostbird" | "toggle_ghostbird" | "open_options"

/** Queries current shortcut key config */
export interface ICommandConfig {
  /**
   * @returns all commands defined in manifest.json
   */
  getAll(): PromiseLike<Readonly<CommandInfo>[]>
}

/** Miscellaneous UI utilities */
export interface IUiUtil {
  /** Opens the options page for the extension */
  openOptionsPage(): Promise<void>
}

/**
 * A single shortcut key command.
 */
export type CommandInfo = {
  name: string
  shortcut: string
}

/** A Thunderbird window where the toolbar button is pressed */
export interface ITab {
  /** The unique identifier for the tab. Missing on special windows like developer tools */
  readonly id?: number | undefined
  /** The type of the tab like "mail", "content", or "messageCompose" */
  readonly type?: string | undefined
}

/** Casts an ITab to a usable utility */
export interface IComposeWindowDetector {
  /**
   * Attempts to wrap a generic tab object into a more specific `IComposeWindow` object.
   * Checks if the tab corresponds to a mail compose window before wrapping.
   *
   * @param tab The tab to check
   * @returns a wrapped instance if the tab is a compose window, otherwise `undefined`
   */
  tryWrap(tab: ITab): IComposeWindow | undefined
}

/** Controls the context menu on the toolbar button */
export interface IButtonMenu {
  /** @returns whether the menu has been initialized */
  isInitialized(): boolean

  /**
   * Creates a context menu shown when the toolbar button is right clicked.
   * @param menuItems Items to show in the menu
   * @param currentShown Information about the menu currently shown
   */
  initItems(menuItems: ReadonlyArray<MenuItem>, currentShown: MenuShownInfo | undefined): Promise<void>
}

/** Information about a menu that is about to be shown */
export type MenuShownInfo = {
  /** A list of IDs of the menu items that is about to be shown */
  menuIds: ReadonlyArray<string>
}

/** An item in a context menu */
export type MenuItem = {
  /** ID of the text to be displayed in the item */
  label: MessageId
  /** The command to execute when the menu item is clicked */
  id: CommandId
  /** path to the icon to display in the menu item */
  icon: string
}
