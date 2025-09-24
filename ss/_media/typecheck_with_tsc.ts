import { spawn } from "node:child_process"
import type { Plugin, PluginContext } from "rolldown"

/** Runs tsc to type-check */
export const typecheckWithTsc = (): Plugin => ({
  name: "typecheck_with_tsc",
  buildStart(this: PluginContext): Promise<void> {
    this.info("Checking types")

    // In watch mode keep running even on error to save devs from having to restart
    const continueOnError = this.meta.watchMode

    const args = ["--build", "--emitDeclarationOnly"]
    const tsc = spawn("tsc", args, { shell: true, stdio: "inherit" })

    return new Promise((resolve, reject) => {
      tsc.on("exit", (code) => {
        if (continueOnError || code === 0) {
          resolve()
        } else {
          reject(`tsc result: ${code}`)
        }
      })
    })
  },
})
