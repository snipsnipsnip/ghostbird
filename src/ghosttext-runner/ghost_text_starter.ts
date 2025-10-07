import type { GhostTextClient } from "src/ghosttext-session"
import type { IClientEditor, IClientOptionsLoader, IGhostTextConnector, IHeart, IStatusIndicator } from "./api"
import { GhostTextRunner } from "./ghost_text_runner"

export class GhostTextStarter {
  static isSingleton = true

  constructor(
    private readonly ghostTextConnector: IGhostTextConnector,
    private readonly ghostTextClient: GhostTextClient,
    private readonly clientOptionsLoader: IClientOptionsLoader,
    private readonly heart: IHeart,
  ) {}

  async run(statusIndicator: IStatusIndicator, editor: IClientEditor): Promise<void> {
    let stopHeartbeat = this.heart.startBeat()
    try {
      let options = await this.clientOptionsLoader.load()
      const runner = new GhostTextRunner(this.ghostTextConnector, options, statusIndicator, editor)
      try {
        const g = this.ghostTextClient.run()

        await runner.run(g)
      } finally {
        await runner.close()
      }
    } finally {
      console.log("generator finished")
      stopHeartbeat()
    }
  }
}
