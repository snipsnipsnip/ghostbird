/**
 * Starts a timer and returns a Disposable that logs the elapsed time when disposed. Intended to use it with `using` statements.
 *
 * @param label Text used as the message label when logging the elapsed time
 * @returns A Disposable which logs the elapsed time in milliseconds when disposed
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
