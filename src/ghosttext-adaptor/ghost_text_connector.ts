import type { IGhostTextConnector, IMessagePort, ISession } from "../ghosttext-runner"
import type { EditorChangeResponse, ServerInitialResponse, UpdateRequest } from "../ghosttext-session"
import type { IWebClient } from "./api"

export class GhostTextConnector implements IGhostTextConnector {
  static isSingleton = true

  constructor(readonly webClient: IWebClient) {}

  async connect(serverUrl: URL): Promise<[ISession, ServerInitialResponse]> {
    let init = (await this.webClient.getJson(serverUrl)) as ServerInitialResponse
    console.info({ init })
    let { ProtocolVersion: ver, WebSocketPort: port } = init

    if (!(1 <= ver) || !(1 <= port)) {
      throw Error(`Unexpected response: ${JSON.stringify(init)}`)
    }

    let wsUrl = new URL(serverUrl)
    wsUrl.port = port as unknown as string
    wsUrl.protocol = "ws"

    let session = new ClientSession(await this.webClient.openWebSocket(wsUrl))

    return [session, init]
  }
}

class ClientSession implements ISession {
  constructor(readonly port: IMessagePort<string, string>) {}

  sendUpdate(update: UpdateRequest): void {
    console.debug(`sending`, update)
    this.port.send(JSON.stringify(update))
  }
  waitServerChange(): Promise<void> {
    return this.port.waitReady()
  }
  popServerChange(): EditorChangeResponse | undefined {
    let text = this.port.clearReceived()
    return text && JSON.parse(text)
  }
  close(): void {
    try {
      this.port.close()
    } catch (errorOnClose) {
      console.warn({ errorOnClose })
    }
  }
}
