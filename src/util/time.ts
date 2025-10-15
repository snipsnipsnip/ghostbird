export interface Disposable {
  [Symbol.dispose]: () => void
}

export function time(label: string): Disposable {
  const start = performance.now()
  return {
    [Symbol.dispose ?? Symbol.for("Symbol.dispose")]: () => {
      const end = performance.now()
      console.debug({ [label]: `${end - start}ms` })
    },
  }
}
