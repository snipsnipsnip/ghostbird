import type { MessagesFromBackground } from "../ghosttext-runner/message"
import type { IBackgroundMessenger, IGhostClientPort } from "./api"

export class ComposeEventRouter {
  static isSingleton = true

  constructor(readonly backgroundMessenger: IBackgroundMessenger) {}

  async handleConnect(port: IGhostClientPort): Promise<void> {
    const body = document.body
    const clearReadOnly = makeReadOnly(body)
    try {
      console.info({ connected: Date.now(), date: new Date() })
      for (;;) {
        let ready = await port.waitReady().then(
          () => true,
          () => false,
        )
        if (!ready) {
          break
        }
        let got = port.clearReceived()
        console.debug({ got })
        if (!got?.text) {
          break
        }
        // TODO sync cursors
        body.textContent = got.text
        // TODO send changes
        // TODO reconnect
      }
    } finally {
      console.info({ disconnected: Date.now(), date: new Date() })
      clearReadOnly()
    }
  }

  handleMessage(message: string): MessagesFromBackground[keyof MessagesFromBackground] {
    console.info({ message })

    if (message === "ping") {
      return response(message)
    } else if (message === "start") {
      return "ok"
    } else if (message === "stop") {
      return "ok"
    } else if (message === "toggle") {
      return "ok"
    } else {
      return "ok"
    }
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

  body.style.background = "slategray"

  body.addEventListener("beforeinput", disable, option)
  body.addEventListener("paste", disable, option)
  body.addEventListener("cut", disable, option)
  body.addEventListener("drop", disable, option)
  body.addEventListener("dragover", disable, option)

  return () => {
    body.style.removeProperty("background")
    controller.abort()
  }
}
