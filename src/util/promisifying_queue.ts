/**
 * A utility class to help implementation of {@see IMessagePort}s.
 * @template TMessage The type of messages queued
 */
export class PromisifyingQueue<TMessage> {
  private readonly receiveQueue = [] as TMessage[]
  private readonly pending = [] as PromiseWithResolvers<void>[]
  private disconnectError: Error | undefined

  /**
   * Checks if the queue connection is still open.
   *
   * @returns true if the connection is open, false if closed
   */
  isOpen(): boolean {
    return !this.disconnectError
  }

  /**
   * Adds a received message to the queue. Resolves all pending consumers.
   *
   * @param msg The message to add to the queue
   */
  pushReceived(msg: TMessage): void {
    this.receiveQueue.push(msg)

    for (let resolvers of this.pending) {
      resolvers.resolve()
    }
    this.pending.length = 0
  }

  /**
   * Close the queue. Rejects all pending and subsequent consumers.
   *
   * @param err Reason to close used to reject awaiting consumers
   */
  notifyClosed(err: Error): void {
    this.disconnectError = err

    for (let resolvers of this.pending) {
      resolvers.reject(err)
    }
    this.pending.length = 0
  }

  /**
   * Wait for a new message to be dequeued.
   *
   * @returns resolves when messages are ready to be dequeued
   * @throws The disconnect error if the connection is closed
   */
  waitReady(): Promise<void> {
    if (this.disconnectError) {
      return Promise.reject(this.disconnectError)
    }

    if (this.receiveQueue.length) {
      return Promise.resolve()
    }

    let resolvers = Promise.withResolvers<void>()
    this.pending.push(resolvers)
    return resolvers.promise
  }

  /**
   * Removes and returns the first message from the queue.
   *
   * @returns The first message in the queue, or undefined if the queue is empty
   * @throws The disconnect error if the connection is closed
   */
  dequeueReceived(): TMessage | undefined {
    if (this.disconnectError) {
      throw this.disconnectError
    }
    return this.receiveQueue.shift()
  }

  /**
   * Clears all messages from the queue and returns the last message that was queued.
   *
   * @returns The last message that was in the queue, or undefined if the queue was empty
   * @throws The disconnect error if the connection is closed
   */
  clearReceived(): TMessage | undefined {
    if (this.disconnectError) {
      throw this.disconnectError
    }

    let len = this.receiveQueue.length
    if (len === 0) {
      return
    }
    let last = this.receiveQueue[len - 1]
    this.receiveQueue.length = 0

    return last
  }
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  describe(PromisifyingQueue, () => {
    it("should be open by default", () => {
      const sut = new PromisifyingQueue<string>()

      expect(sut.isOpen()).toBe(true)
    })

    it("should be closed after notifyClosed", () => {
      const sut = new PromisifyingQueue<string>()
      const error = new Error("Connection closed")

      sut.notifyClosed(error)

      expect(sut.isOpen()).toBe(false)
    })

    it("should allow dequeuing before closure", () => {
      const sut = new PromisifyingQueue<string>()
      const error = new Error("Connection closed")

      sut.pushReceived("hello")
      sut.pushReceived("world")

      expect(sut.dequeueReceived()).toBe("hello")
      expect(sut.clearReceived()).toBe("world")

      sut.notifyClosed(error)

      expect(() => sut.dequeueReceived()).toThrow(error)
      expect(() => sut.clearReceived()).toThrow(error)
    })

    it("should notify existing consumers when pushed", async () => {
      const sut = new PromisifyingQueue<string>()

      let wait = sut.waitReady()

      expect(sut.dequeueReceived()).toBe(undefined)
      await expect(isPending(wait)).resolves.toBe(true)

      sut.pushReceived("hello")
      sut.pushReceived("cruel")
      sut.pushReceived("world")

      await expect(isPending(wait)).resolves.toBe(false)

      expect(sut.dequeueReceived()).toBe("hello")
      expect(sut.clearReceived()).toBe("world")
    })

    it("should reject pending consumers when closed", async () => {
      const sut = new PromisifyingQueue<string>()
      const error = new Error("Connection closed")

      const wait = sut.waitReady()

      sut.notifyClosed(error)

      await expect(wait).rejects.toBe(error)
    })

    it("should reject waitReady immediately when already closed", async () => {
      const sut = new PromisifyingQueue<string>()
      const error = new Error("Connection closed")

      sut.notifyClosed(error)

      await expect(sut.waitReady()).rejects.toBe(error)
    })

    it("should throw when dequeueReceived called on closed queue", () => {
      const sut = new PromisifyingQueue<string>()
      const error = new Error("Connection closed")

      sut.pushReceived("message")
      sut.notifyClosed(error)

      expect(() => sut.dequeueReceived()).toThrow(error)
    })

    it("should throw when clearReceived called on closed queue", () => {
      const sut = new PromisifyingQueue<string>()
      const error = new Error("Connection closed")

      sut.pushReceived("message")
      sut.notifyClosed(error)

      expect(() => sut.clearReceived()).toThrow(error)
    })
  })

  const PENDING = Symbol("pending")
  async function isPending(promise: Promise<unknown>): Promise<boolean> {
    let raced = await Promise.race([promise, Promise.resolve(PENDING)])
    return raced === PENDING
  }
}
