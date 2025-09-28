import type { ClientOptions, IClientOptionsLoader } from "src/ghosttext-runner/api"
import type { IManifestInfo, IStoredOptionsLoader } from "./api"

export class ClientOptionsLoader implements IClientOptionsLoader {
  static isSingleton = true

  constructor(
    private readonly storedOptionsLoader: IStoredOptionsLoader,
    private readonly manifestInfo: IManifestInfo,
  ) {}

  async load(): Promise<ClientOptions> {
    let { serverPort } = await this.storedOptionsLoader.load()
    let serverUrl = new URL(`http://localhost:${serverPort}/`)
    let { host } = new URL(`extension: //${this.manifestInfo.getId()}.localhost`)

    return {
      serverUrl,
      clientHostName: host,
    }
  }
}
