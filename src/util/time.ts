export interface Disposable {
  [Symbol.dispose]: () => void
}

/**
 * Starts a timer and returns a Disposable that logs the elapsed time when disposed.
 *
 * @param label - Text used as the message label when logging the elapsed time
 * @returns A Disposable whose `[Symbol.dispose]` method logs the elapsed time in milliseconds as "`<label>: <X>ms`"
 */
export function time(label: string): Disposable {
  const start = performance.now()
  return {
    [Symbol.dispose ?? Symbol.for("Symbol.dispose")]: () => {
      const end = performance.now()
      console.debug({ [label]: `${end - start}ms` })
    },
  }
}
