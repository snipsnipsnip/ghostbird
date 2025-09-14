import type { IMessagePort } from "../../ghosttext-runner/message"
import { PromisifyingQueue } from "../../util/promisifying_queue"

export class PromisifiedWebSocket implements IMessagePort<string, string> {
  private readonly q = new PromisifyingQueue<string>()

  /**
   * Start listening to the WebSocket.
   * @returns A promise that resolves to the wrapper on open.
   */
  static listenTo(socket: WebSocket): Promise<PromisifiedWebSocket> {
    const p = new PromisifiedWebSocket(socket)

    let { promise, resolve, reject } = Promise.withResolvers<PromisifiedWebSocket>()
    p.registerListeners(resolve, reject)

    return promise
  }

  private constructor(private readonly socket: WebSocket) {}

  private registerListeners(resolve: (value: this) => void, reject: (err: Error) => void): void {
    this.socket.addEventListener(
      "open",
      () => {
        resolve(this)
      },
      { once: true },
    )
    this.socket.addEventListener(
      "error",
      (_) => {
        const err = Error("WebSocket has been closed by error")
        reject(err)

        this.q.notifyClosed(err)
      },
      { once: true },
    )
    this.socket.addEventListener(
      "close",
      (e) => {
        let { code, reason, wasClean } = e
        let info = { code, reason, wasClean }
        let err = Error(JSON.stringify(info))

        reject(err)
        this.q.notifyClosed(err)
      },
      { once: true },
    )
    this.socket.addEventListener("message", ({ data }) => {
      console.debug({ received: data })
      console.assert(typeof data === "string", "message has to be a string")
      this.q.pushReceived(data)
    })
  }

  isOpen(): boolean {
    return this.socket.readyState === WebSocket.OPEN
  }

  waitReady(): Promise<void> {
    return this.q.waitReady()
  }

  dequeueReceived(): string | undefined {
    return this.q.dequeueReceived()
  }

  clearReceived(): string | undefined {
    return this.q.clearReceived()
  }

  send(msg: string): void {
    this.socket.send(msg)
  }

  close(): void {
    this.socket.close()
  }
}
