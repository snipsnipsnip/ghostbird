import type { IMessagePort } from "src/ghosttext-runner"
import { PromisifyingQueue } from "src/util/promisifying_queue"

/**
 * Creates a pair of promisified message ports from a MessageChannel.
 *
 * @template TRequest The type of messages the first returned port can send and the second expects to receive
 * @template TResponse The type of messages the first returned port expects to receive and the second can send
 * @returns A tuple `[IMessagePort<TRequest, TResponse>, IMessagePort<TResponse, TRequest>]` where the first element is a promisified port for sending `TRequest` and receiving `TResponse`, and the second element is a promisified port for sending `TResponse` and receiving `TRequest`
 */
export function promisifyMessageChannel<TRequest extends object | string, TResponse extends object | string>({
  port1,
  port2,
}: MessageChannel): [IMessagePort<TRequest, TResponse>, IMessagePort<TResponse, TRequest>] {
  return [PromisifiedMessagePort.listenTo(port1), PromisifiedMessagePort.listenTo(port2)]
}

/**
 * A MessagePort wrapped in a Promise-based API.
 * MessagePort's `close()` doesn't notify the other side, so we send a `null` to signal disconnect.
 * NB: Type parameters are just a contract and message content aren't checked.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MessagePort
 * @template TRequest The type of messages which this port can send
 * @template TResponse The type of messages which this port expects to receive
 */
export class PromisifiedMessagePort<TRequest extends object | string, TResponse extends object | string>
  implements IMessagePort<TRequest, TResponse>
{
  private readonly q = new PromisifyingQueue<TResponse>()

  static listenTo<TRequest extends object | string, TResponse extends object | string>(
    port: MessagePort,
  ): IMessagePort<TRequest, TResponse> {
    const p = new PromisifiedMessagePort<TRequest, TResponse>(port)
    p.registerListeners()

    return p
  }

  private constructor(private readonly port: MessagePort) {}

  isOpen(): boolean {
    return this.q.isOpen()
  }

  private registerListeners(): void {
    this.port.onmessage = ({ data }: MessageEvent<TResponse>): void => {
      if (data == null) {
        this.handleClose()
      } else {
        this.q.pushReceived(data)
      }
    }
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
    console.info("closing MessagePort", this.port)
    this.port.postMessage(null)
    this.handleClose()
  }

  private handleClose(): void {
    this.port.close()
    this.q.notifyClosed(Error("MessagePort already closed"))
  }
}
