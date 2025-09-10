import type { IBackgroundMessenger } from "../../app-compose"

export class BackgroundMessenger implements IBackgroundMessenger {
  static isSingleton = true

  constructor(readonly messenger: typeof globalThis.messenger) {}

  send<const TType extends "ping">(msg: TType): Promise<{ ping: "pong" }[TType]> {
    return this.messenger.runtime.sendMessage(msg)
  }
}
