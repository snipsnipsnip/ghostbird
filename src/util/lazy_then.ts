/** A value or a promise of it */
export type Awaitable<T> = T | Promise<T>

/** A closure that supplies a value to the callback, which may be async */
export type LazyThen<T> = <U>(cont: (value: T) => Awaitable<U>) => Awaitable<U>

/**
 * Caches a value that is initialized asynchronously.
 * Returned closure produces `Promise<T>` on first call, then `T` __synchronously__ on subsequent calls.
 * @param init initializer function that returns a `Promise<T>` to be cached
 * @returns a closure that produces a `T` or a `Promise<T>`
 */
export function awaitable<T>(init: () => Promise<T>): () => Awaitable<T> {
  let cache: Awaitable<T> | undefined

  return () => {
    if (cache == null) {
      cache = init().then((val) => {
        cache = val
        return val
      })
    }

    return cache
  }
}

/**
 * Caches a value that is initialized asynchronously.
 * Returned closure calls the continuation (which may be async) with the cached value.
 * @param init initializer function that returns a `Promise<T>` to be cached
 * @returns a closure that expects a continuation function that receives the cached value.
 */
export function makeLazyThen<T>(init: () => Promise<T>): LazyThen<T> {
  let valueCache: T | undefined
  let promiseCache: Promise<T> | undefined

  return <U>(cont: (value: T) => Awaitable<U>): Awaitable<U> => {
    if (valueCache != null) {
      return cont(valueCache)
    }

    promiseCache ??= init().then((val) => {
      valueCache = val
      promiseCache = undefined
      return val
    })

    return promiseCache.then(cont)
  }
}
