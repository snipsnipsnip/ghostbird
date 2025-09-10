/**
 * A utility class to help implementation of {@see IMessagePort}s.
 * @template TMessage The type of messages queued
 */
export class PromisifyingQueue<TResponse> {
  private readonly receiveQueue = [] as TResponse[]
  private readonly pending = [] as PromiseWithResolvers<void>[]
  private disconnectError: Error | undefined

  isOpen(): boolean {
    return !this.disconnectError
  }

  pushReceived(msg: TResponse): void {
    this.receiveQueue.push(msg)

    for (let resolvers of this.pending) {
      resolvers.resolve()
    }
    this.pending.length = 0
  }

  notifyClosed(err: Error): void {
    this.disconnectError = err

    for (let resolvers of this.pending) {
      resolvers.reject()
    }
    this.pending.length = 0
  }

  waitReady(): Promise<void> {
    if (this.receiveQueue.length) {
      return Promise.resolve()
    }
    // Wait for next message
    let resolvers = Promise.withResolvers<void>()
    this.pending.push(resolvers)

    return resolvers.promise
  }

  dequeueReceived(): TResponse | undefined {
    return this.receiveQueue.shift()
  }

  clearReceived(): TResponse | undefined {
    let len = this.receiveQueue.length
    if (len === 0) {
      return
    }
    let last = this.receiveQueue[len - 1]
    this.receiveQueue.length = 0

    return last
  }
}
