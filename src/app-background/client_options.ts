import type { IClientOptions } from "src/ghosttext-runner/api"

export class ClientOptions implements IClientOptions {
  static isSingleton = true
  // TODO make it configurable
  serverUrl = new URL("http://localhost:4001/")
}
