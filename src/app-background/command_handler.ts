import type { IComposeWindow } from "src/ghosttext-adaptor"
import type { CommandId } from "./api"
import type { ComposeActionNotifier } from "./compose_action_notifier"

/** Handles execution of commands in the context a compose tab */

export class CommandHandler {
  static isSingleton = true
  constructor(private readonly composeActionNotifier: ComposeActionNotifier) {}

  /** Executes a command in the context of a compose tab */
  runCommand(command: CommandId, composeTab: IComposeWindow): Promise<void> {
    switch (command) {
      case "start_ghostbird":
        return this.composeActionNotifier.start(composeTab)
      case "stop_ghostbird":
        return this.composeActionNotifier.stop(composeTab)
      case "toggle_ghostbird":
        return this.composeActionNotifier.toggle(composeTab)
    }
    // We don't handle default here so that tsc checks for exhaustiveness
  }
}
