import type { CommandInfo, ICommandConfig } from "src/app-background/api"

export class CommandConfig implements ICommandConfig {
  static isSingleton = true

  constructor(readonly messenger: typeof globalThis.messenger) {}

  getAll(): Promise<CommandInfo[]> {
    return this.messenger.commands.getAll() as Promise<CommandInfo[]>
  }
}
