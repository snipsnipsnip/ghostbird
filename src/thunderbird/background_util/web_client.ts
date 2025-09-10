import type { IWebClient } from "../../ghosttext-adaptor/api"
import type { IMessagePort } from "../../ghosttext-runner/message"
import { PromisifiedWebSocket } from "../util/promisified_web_socket"

export class WebClient implements IWebClient {
  static isSingleton = true

  openWebSocket(wsUrl: URL): PromiseLike<IMessagePort<string, string>> {
    console.info(`opening ${wsUrl}`)
    return PromisifiedWebSocket.listenTo(new WebSocket(wsUrl))
  }

  async getJson(serverUrl: URL): Promise<object> {
    console.info(`fetching ${serverUrl}`)
    const res = await fetch(serverUrl)
    return res.json()
  }
}
