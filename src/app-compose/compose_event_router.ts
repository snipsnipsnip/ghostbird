import type { ExternalEdit, MessagesFromBackground } from "../ghosttext-runner"
import type { BodyState } from "../ghosttext-session/types"
import type { IBackgroundMessenger, IGhostClientPort } from "./api"

export class ComposeEventRouter {
  static isSingleton = true

  constructor(
    readonly body: HTMLBodyElement,
    readonly backgroundMessenger: IBackgroundMessenger,
  ) {}

  async handleConnect(port: IGhostClientPort): Promise<void> {
    const clearReadOnly = makeReadOnly(this.body)
    try {
      console.info({ connected: Date.now(), date: new Date() })

      port.send({ html: this.body.innerHTML, plainText: this.body.textContent } satisfies BodyState)

      for (;;) {
        await port.waitReady()

        let got = port.clearReceived()

        if (!got || !this.applyEdit(got)) {
          break
        }

        // TODO sync cursors
        // TODO send changes
      }
    } catch (thrown) {
      console.info({ thrown })
    } finally {
      console.info({ disconnected: Date.now(), date: new Date() })
      clearReadOnly()
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
}

function response(_message: "ping"): MessagesFromBackground["ping"] {
  return "pong"
}

function makeReadOnly(body: HTMLElement): () => void {
  const disable = (e: Event) => {
    if ("getTargetRanges" in e) {
      let i = e as InputEvent
      console.log({ data: i.data, ranges: i.getTargetRanges() })
    }
    e.preventDefault()
  }
  const controller = new AbortController()
  const option = { signal: controller.signal }

  body.addEventListener("beforeinput", disable, option)
  body.addEventListener("paste", disable, option)
  body.addEventListener("cut", disable, option)
  body.addEventListener("drop", disable, option)
  body.addEventListener("dragover", disable, option)

  body.style.background = "lightgray"
  body.style.pointerEvents = "none"
  body.blur()

  return () => {
    body.style.removeProperty("pointerEvents")
    body.style.removeProperty("background")
    controller.abort()
  }
}
