import type { BackgroundEventRouter } from "src/app-background"

/** Action to be performed in background script when some event happens in background script */
export type RouterHandler = (r: BackgroundEventRouter) => Promise<void> | undefined

/** Cached router instance */
let routerCache: BackgroundEventRouter | undefined

/** Promise for loading the router, used to avoid multiple concurrent loads */
let routerPromise: Promise<BackgroundEventRouter> | undefined

/**
 * Executes a handler function with the background event router.
 *
 * @param handler The function to execute with the router
 * @returns A promise that resolves when the handler completes, or undefined if an error occurs
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
 * Executes a handler function synchronously with the provided router.
 *
 * @param handler The function to execute with the router
 * @param router The background event router to use
 * @returns A promise that resolves when the handler completes, or undefined if an error occurs
 */
function runHandler(handler: RouterHandler, router: BackgroundEventRouter): Promise<void> | undefined {
  try {
    return handler(router)
  } catch (error) {
    console.error({ error })
    return
  }
}
