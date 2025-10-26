import { spawn } from "node:child_process"
import type { Plugin, PluginContext } from "rolldown"

/** Runs vitest for sanity check */
export const testSanity = (): Plugin => {
  const { promise, reject, resolve } = Promise.withResolvers<void>()
  return {
    name: "test_sanity",
    buildStart(this: PluginContext): void {
      this.info("Testing sanity")

      // In watch mode keep running even on error to save devs from having to restart
      const continueOnError = this.meta.watchMode

      const args = ["run", "sanity", "--reporter=github-actions"]
      const vitest = spawn("vitest", args, { shell: true, stdio: "ignore" })

      vitest.on("exit", (code) => {
        if (continueOnError || code === 0) {
          resolve()
        } else {
          reject(Error(`test_sanity failed. Try running tests (code: ${code})`))
        }
      })
    },
    writeBundle(): Promise<void> {
      return promise
    },
  }
}
