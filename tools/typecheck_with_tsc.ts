import { spawn } from "node:child_process"
import type { Plugin, PluginContext } from "rolldown"

/** Runs tsc to type-check */
export const typecheckWithTsc = (): Plugin => {
  const { promise, reject, resolve } = Promise.withResolvers<void>()
  return {
    name: "typecheck_with_tsc",
    buildStart(this: PluginContext): void {
      this.info("Checking types")

      // In watch mode keep running even on error to save devs from having to restart
      const continueOnError = this.meta.watchMode

      const args = ["--build", "--emitDeclarationOnly"]
      const tsc = spawn("tsc", args, { shell: true, stdio: "inherit" })

      tsc.on("exit", (code) => {
        if (continueOnError || code === 0) {
          resolve()
        } else {
          reject(Error(`typecheck_with_tsc failed (code: ${code})`))
        }
      })
    },
    writeBundle(): Promise<void> {
      return promise
    },
  }
}
