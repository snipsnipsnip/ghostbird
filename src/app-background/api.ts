import type { IComposeWindow } from "../ghosttext-adaptor/api"

export type { IGhostServerPort } from "../ghosttext-adaptor/api"

/** IDs of shortcut keys. Must be in sync with ones in manifest.json */
export type CommandId = "start-ghostbird" | "stop-ghostbird"

/** Queries current shortcut key config */
export interface ICommandConfig {
  /**
   * @returns all commands defined in manifest.json
   */
  getAll(): PromiseLike<Readonly<CommandInfo>[]>
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
