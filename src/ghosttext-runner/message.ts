/** @file data sent through tabs */

export interface MessagesFromBackground {
  ping: "pong"
  other: "ok"
}

/**
 * A messaging channel that returns responses.
 * @template TCatalog The record type that maps types of sending messages to respective expected responses
 */
export interface IMessenger<TCatalog> {
  /**
   * Sends a message to the other end.
   * @returns A promise that resolves to a response, or rejects if the message couldn't be sent.
   */
  send<const TType extends string & keyof TCatalog>(msg: TType): Promise<TCatalog[TType]>
}

/**
 * A full-duplex buffered message channel.
 * @template TRequest The type of messages which this port can send
 * @template TResponse The type of messages which this port can receive
 */
export interface IMessagePort<TRequest extends object | string, TResponse extends object | string> {
  /**
   * @returns true if the port is still open, false if already closed
   */
  isOpen(): boolean

  /**
   * Wait for the next incoming message.
   * @returns A promise that resolves when a message is available, or rejects if disconnected
   */
  waitReady(): Promise<void>

  /**
   * dequeues the earliest message.
   * @returns the dequeued message, or `undefined` if not available
   */
  dequeueReceived(): TResponse | undefined

  /**
   * Clears the buffer and returns the latest message.
   * @returns the latest message, or `undefined` if not available
   */
  clearReceived(): TResponse | undefined

  /**
   * Queues a message to be sent.
   * @param msg Object to be sent
   * @throws Already disconnected
   */
  send(msg: TRequest): void

  /**
   * Closes the port.
   */
  close(): void
}
