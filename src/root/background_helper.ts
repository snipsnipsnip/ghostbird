import type { BackgroundEventRouter } from "src/app-background"

/** Action to be performed in background script when some event happens in background script */
export type RouterHandler = (r: BackgroundEventRouter) => Promise<void> | undefined

/** Cached router instance */
let routerCache: BackgroundEventRouter | undefined

/** Promise for loading the router, used to avoid multiple concurrent loads */
let routerPromise: Promise<BackgroundEventRouter> | undefined

/**
 * Ensure a BackgroundEventRouter is available and invoke the given handler with it.
 *
 * @param handler - Function invoked with the prepared BackgroundEventRouter
 * @returns a promise when the handler is running async or the BackgroundEventRouter has been initialized, or `undefined` if finished synchronously
 */
export function withRouter(handler: RouterHandler): Promise<void> | undefined {
  if (routerCache) {
    return runHandler(handler, routerCache)
  }

  routerPromise ??= import("./startup/startup_background").then((s) => s.prepareBackgroundRouter())

  return routerPromise.then((router) => {
    routerCache = router
    routerPromise = undefined

    return runHandler(handler, router)
  })
}

/**
 * Invokes the provided handler with the given BackgroundEventRouter and returns the handler's result.
 *
 * @param handler - The function to execute with the router
 * @param router - The background event router to pass to `handler`
 * @returns A promise or an undefined returned by `handler`
 */
function runHandler(handler: RouterHandler, router: BackgroundEventRouter): Promise<void> | undefined {
  try {
    return handler(router)
  } catch (error) {
    console.error({ error })
    return
  }
}
