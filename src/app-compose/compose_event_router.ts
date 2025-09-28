import type { MessagesFromBackground } from "src/ghosttext-runner"
import type { IGhostClientPort } from "./api"
import type { ComposeEditListener } from "./compose_edit_listener"
import type { PortHandler } from "./port_handler"

export class ComposeEventRouter {
  static isSingleton = true

  constructor(
    private readonly portHandler: PortHandler,
    private readonly composeEditListener: ComposeEditListener,
  ) {}

  async handleConnect(port: IGhostClientPort): Promise<void> {
    const clearEventHandlers = this.composeEditListener.listen()
    try {
      console.info({ connected: Date.now(), date: new Date() })

      await this.portHandler.handleConnect(port)
    } catch (thrown) {
      console.info({ thrown })
    } finally {
      console.info({ disconnected: Date.now(), date: new Date() })
      clearEventHandlers()
    }
  }

  handleMessage(message: string): MessagesFromBackground[keyof MessagesFromBackground] {
    console.info({ message })

    if (message === "ping") {
      return response(message)
    } else {
      return "ok"
    }
  }
}

function response(_message: "ping"): MessagesFromBackground["ping"] {
  return "pong"
}
