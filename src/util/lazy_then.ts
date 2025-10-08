/** A value or a promise of it */
export type Awaitable<T> = T | Promise<T>

/** A closure that supplies a value to the callback, which may be async */
export type LazyThen<T> = <U>(cont: (value: T) => Awaitable<U>) => Awaitable<U>

/**
 * Caches a value that is initialized asynchronously.
 * Returned closure calls the continuation (which may be async) with the cached value.
 * Returned closure produces a promise that resolves to the value returned from the continuation on first call,
 * then returns the value __synchronously__ on subsequent calls
 * (provided that the continuation is synchronous and the first call has settled).
 * @param init initializer function that returns a `Promise<T>` to be cached
 * @returns a closure that expects a continuation function that receives the cached value.
 */
export function makeLazyThen<T>(init: () => Promise<T>): LazyThen<T> {
  let valueCache: T | undefined
  let promiseCache: Promise<T> | true | undefined

  return <U>(cont: (value: T) => Awaitable<U>): Awaitable<U> => {
    if (promiseCache === true) {
      return cont(valueCache as T)
    }

    promiseCache ??= init().then((val) => {
      valueCache = val
      promiseCache = true
      return val
    })

    return promiseCache.then(cont)
  }
}

if (import.meta.vitest) {
  const { describe, it, vi: jest } = import.meta.vitest

  describe.concurrent(makeLazyThen, () => {
    it("should return a Promise on first call", async ({ expect }) => {
      const init = jest.fn(async () => 42)
      const lazyThen = makeLazyThen(init)

      let result: number | undefined
      let ret = lazyThen((r) => {
        result = r
        return "hello"
      })

      expect(ret).toBeInstanceOf(Promise)
      expect(init).toHaveBeenCalledTimes(1)
      expect(result).toBeUndefined()
      await expect(ret).resolves.toBe("hello")
      expect(result).toBe(42)
    })

    it("should return cached value synchronously after resolution", async ({ expect }) => {
      const init = jest.fn(async () => "cached")
      const lazyThen = makeLazyThen(init)

      await lazyThen(() => {}) // First call returns a promise
      const result = lazyThen((r) => r) // Second call returns synchronously

      expect(result).toBe("cached")
      expect(init).toHaveBeenCalledTimes(1)
    })

    it("should call continuations transparently", async ({ expect }) => {
      const lazyThen = makeLazyThen(async () => "hello")

      const result1 = await lazyThen((r) => `${r}, world`)
      const result2 = lazyThen((r) => `${r}, there`)
      const result3 = lazyThen(async (r) => `${r}, lad`)

      expect(result1).toBe("hello, world")
      expect(result2).toBe("hello, there")
      await expect(result3).resolves.toBe("hello, lad")
    })

    it("should handle race conditions", async ({ expect }) => {
      const { promise, resolve } = Promise.withResolvers<string>()
      const init = jest.fn(() => promise)
      const lazyThen = makeLazyThen(init)

      // Call multiple times before resolution
      const call1 = lazyThen((r) => r)
      const call2 = lazyThen((r) => r)
      const call3 = lazyThen((r) => r)

      resolve("value")
      await expect(call1).resolves.toBe("value")
      await expect(call2).resolves.toBe("value")
      await expect(call3).resolves.toBe("value")

      const call4 = lazyThen((r) => r)
      expect(call4).toBe("value") // Now returns sync value
      expect(init).toHaveBeenCalledTimes(1)
    })

    it("should handle objects", async ({ expect }) => {
      const obj = { foo: "bar", nested: { value: 123 } }
      const init = jest.fn(async () => obj)
      const lazyThen = makeLazyThen(init)

      await lazyThen((r) => r)
      const result = lazyThen((r) => r)

      expect(result).toBe(obj)
      expect(result).toEqual({ foo: "bar", nested: { value: 123 } })
    })

    it("should handle rejected promises", async ({ expect }) => {
      const init = jest.fn(() => Promise.reject(new Error("Init failed")))
      const lazyThen = makeLazyThen(init)

      const result = lazyThen((r) => r)

      await expect(result).rejects.toThrow("Init failed")

      // After rejection, subsequent calls return the rejected Promise
      const result2 = lazyThen((r) => r)
      await expect(result2).rejects.toThrow("Init failed")

      expect(init).toHaveBeenCalledTimes(1)
    })

    it("should handle async init with delay", async ({ expect }) => {
      jest.useFakeTimers()

      const init = jest.fn(() => new Promise<number>((resolve) => setTimeout(() => resolve(100), 1000)))
      const lazyThen = makeLazyThen(init)

      const promise = lazyThen((r) => r)
      expect(promise).toBeInstanceOf(Promise)

      jest.advanceTimersByTime(1000)
      await promise

      const syncResult = lazyThen((r) => r)
      expect(syncResult).toBe(100)

      jest.useRealTimers()
    })

    it.for([null, undefined, 0, "", false])("should handle falsy values", async (val, { expect }) => {
      const lazyThen = makeLazyThen(async () => val)

      await expect(lazyThen((r) => r)).resolves.toBe(val)

      expect(lazyThen((r) => r)).toBe(val)
    })

    it("should handle concurrent awaits", async ({ expect }) => {
      let callCount = 0
      const init = jest.fn(
        () =>
          new Promise<number>((resolve) => {
            setTimeout(resolve, 10, ++callCount)
          }),
      )
      const lazyThen = makeLazyThen(init)

      const [result1, result2, result3] = await Promise.all([
        lazyThen((r) => r),
        lazyThen((r) => r),
        lazyThen((r) => r),
      ])

      expect(init).toHaveBeenCalledTimes(1)
      expect(result1).toBe(1)
      expect(result2).toBe(1)
      expect(result3).toBe(1)

      const syncResult = lazyThen((r) => r)
      expect(syncResult).toBe(1)
      expect(init).toHaveBeenCalledTimes(1)
    })
  })
}
