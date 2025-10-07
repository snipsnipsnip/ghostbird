import type { ClientOptions, IClientOptionsLoader } from "src/ghosttext-runner/api"
import type { IManifestInfo, IStoredOptionsLoader } from "./api"

export class ClientOptionsLoader implements IClientOptionsLoader {
  static isSingleton = true

  constructor(
    private readonly storedOptionsLoader: IStoredOptionsLoader,
    private readonly manifestInfo: IManifestInfo,
  ) {}

  async load(): Promise<ClientOptions> {
    let { serverPort, enableNotifications } = await this.storedOptionsLoader.load()
    const extensionId = this.manifestInfo.getId()
    let serverUrl = new URL(`http://localhost:${serverPort}/`)
    let { host } = new URL(`extension://${extensionId}.localhost`)

    return {
      serverUrl,
      clientHostName: host,
      enableNotifications,
    }
  }
}

if (import.meta.vitest) {
  const { describe, expect, it, vi } = import.meta.vitest

  describe(ClientOptionsLoader, () => {
    it("should build a ClientOption from storage and manifest info correctly", async () => {
      const storedOptionsLoader = {
        load: vi.fn().mockResolvedValue({
          serverPort: 1234,
          enableNotifications: true,
        }),
      }
      const manifestInfo = { getId: vi.fn().mockReturnValue("@test.extension") }
      const sut = new ClientOptionsLoader(storedOptionsLoader, manifestInfo)

      await expect(sut.load()).resolves.deep.equals({
        serverUrl: new URL("http://localhost:1234/"),
        clientHostName: "test.extension.localhost",
        enableNotifications: true,
      })
    })
  })
}
