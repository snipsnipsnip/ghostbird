import type { IMessagePort } from "../../ghosttext-runner"
import type { Port } from "../messenger"
import { PromisifyingQueue } from "./promisifying_queue"

/**
 * A port wrapped in a Promise-based API.
 * NB: Type parameters are just a contract and message content aren't checked.
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/Port
 * @template TRequest The type of messages which this port can send
 * @template TResponse The type of messages which this port expects to receive
 */
export class PromisifiedPort<TRequest extends object, TResponse extends object | string>
  implements IMessagePort<TRequest, TResponse>
{
  private readonly q = new PromisifyingQueue<TResponse>()

  static listenTo<TRequest extends object, TResponse extends object>(port: Port): IMessagePort<TRequest, TResponse> {
    const p = new PromisifiedPort<TRequest, TResponse>(port)
    p.registerListeners()

    return p
  }

  private constructor(private readonly port: Port) {}

  isOpen(): boolean {
    return this.q.isOpen()
  }

  private registerListeners(): void {
    this.port.onMessage.addListener((msg) => {
      this.q.pushReceived(msg as TResponse)
    })

    this.port.onDisconnect.addListener(() => {
      this.q.notifyClosed(this.port.error ?? Error("Port disconnected"))
    })
  }

  waitReady(): Promise<void> {
    return this.q.waitReady()
  }

  dequeueReceived(): TResponse | undefined {
    return this.q.dequeueReceived()
  }

  clearReceived(): TResponse | undefined {
    return this.q.clearReceived()
  }

  send(msg: TRequest): void {
    this.port.postMessage(msg)
  }

  close(): void {
    this.port.disconnect()
  }
}
