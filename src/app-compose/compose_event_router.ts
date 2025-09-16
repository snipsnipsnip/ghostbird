import type { ExternalEdit, MessagesFromBackground } from "../ghosttext-runner"
import type { BodyState } from "../ghosttext-session/types"
import { PromisifyingQueue } from "../util/promisifying_queue"
import type { IBackgroundMessenger, IGhostClientPort } from "./api"

export class ComposeEventRouter {
  static isSingleton = true

  constructor(
    readonly body: HTMLBodyElement,
    readonly backgroundMessenger: IBackgroundMessenger,
  ) {}

  async handleConnect(port: IGhostClientPort): Promise<void> {
    let q = new PromisifyingQueue<InputEvent>()
    const clearEventHandlers = this.listen(q)
    try {
      console.info({ connected: Date.now(), date: new Date() })

      port.send({ html: this.body.innerHTML, plainText: this.body.textContent } satisfies BodyState)

      for (;;) {
        let winner = await Promise.race([
          port.waitReady().then(() => "port" as const),
          q.waitReady().then(() => "input" as const),
        ])

        if (winner === "port") {
          let got = port.clearReceived()

          if (!got || !this.applyEdit(got)) {
            break
          }
        } else if (winner === "input") {
          let inputEvent = q.clearReceived()
          console.log({ inputEvent })
          port.send({ html: this.body.innerHTML, plainText: this.body.textContent } satisfies BodyState)
        }

        // TODO sync cursors
        // TODO send changes
      }
    } catch (thrown) {
      console.info({ thrown })
    } finally {
      console.info({ disconnected: Date.now(), date: new Date() })
      clearEventHandlers()
    }
  }

  handleMessage(message: string): MessagesFromBackground[keyof MessagesFromBackground] {
    console.info({ message })

    if (message === "ping") {
      return response(message)
    } else {
      return "ok"
    }
  }

  private applyEdit(got: ExternalEdit): boolean {
    console.debug({ got })

    if (typeof got.plainText === "string") {
      this.body.textContent = got.plainText
      return true
    }

    if (typeof got.html === "string") {
      this.body.innerHTML = got.html
      return true
    }

    return false
  }

  private listen(q: PromisifyingQueue<InputEvent>): () => void {
    const controller = new AbortController()
    const option = { signal: controller.signal }

    this.body.addEventListener("input", (e) => q.pushReceived(e as InputEvent), option)

    this.body.style.background = "lightgray"

    controller.signal.addEventListener("abort", () => {
      this.body.style.removeProperty("background")
    })

    return () => controller.abort()
  }
}

function response(_message: "ping"): MessagesFromBackground["ping"] {
  return "pong"
}
