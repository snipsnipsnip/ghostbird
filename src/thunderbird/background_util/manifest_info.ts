import type { CommandInfo, ICommandConfig } from "src/app-background/api"
import type { IManifestInfo } from "src/ghosttext-adaptor/api"

export class ManifestInfo implements ICommandConfig, IManifestInfo {
  static isSingleton = true
  static aliases = ["CommandConfig"]

  constructor(readonly messenger: typeof globalThis.messenger) {}

  getAll(): Promise<CommandInfo[]> {
    return this.messenger.commands.getAll() as Promise<CommandInfo[]>
  }

  getId(): string {
    return this.messenger.runtime.id
  }
}
