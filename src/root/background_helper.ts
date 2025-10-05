import type { BackgroundEventRouter } from "src/app-background"

/** Action to be performed in background script when some event happens in background script */
export type RouterHandler = (r: BackgroundEventRouter) => Promise<void> | undefined

/** Cached router instance */
let router: BackgroundEventRouter | undefined

/**
 * Executes a handler function with the background event router.
 *
 * @param handler The function to execute with the router
 * @returns A promise that resolves when the handler completes, or undefined if an error occurs
 */
export function withRouter(handler: RouterHandler): Promise<void> | undefined {
  if (router) {
    return withRouterSync(handler, router)
  } else {
    return withRouterAsync(handler)
  }
}

/**
 * Executes a handler function synchronously with the provided router.
 *
 * @param handler The function to execute with the router
 * @param router The background event router to use
 * @returns A promise that resolves when the handler completes, or undefined if an error occurs
 */
function withRouterSync(handler: RouterHandler, router: BackgroundEventRouter): Promise<void> | undefined {
  try {
    return handler(router)
  } catch (error) {
    console.error({ error })
    return
  }
}

/**
 * Initializes the background event router and executes a handler.
 *
 * @param handler The function to execute with the initialized router
 * @returns A promise that resolves when the handler completes
 */
async function withRouterAsync(handler: RouterHandler): Promise<void> {
  const { prepareBackgroundRouter } = await import("./startup/startup_background")
  router = prepareBackgroundRouter()

  return withRouterSync(handler, router)
}
