import type { MessagesFromBackground } from "src/ghosttext-runner"
import type { IBackgroundMessenger, IGhostClientPort } from "./api"

export class ComposeEventRouter {
  static isSingleton = true

  constructor(
    readonly body: HTMLBodyElement,
    readonly backgroundMessenger: IBackgroundMessenger,
  ) {}

  async handleConnect(port: IGhostClientPort): Promise<void> {
    const clearEventHandlers = this.listen()
    try {
      console.info({ connected: Date.now(), date: new Date() })

      let isPlainText = await this.receiveFormat(port)

      this.sendBody(port, isPlainText)

      for (;;) {
        await port.waitReady()

        const got = port.clearReceived()
        if (!got || !("body" in got)) {
          break
        }
        this.applyEdit(got.body, isPlainText)
      }
    } catch (thrown) {
      console.info({ thrown })
    } finally {
      console.info({ disconnected: Date.now(), date: new Date() })
      clearEventHandlers()
    }
  }

  private async receiveFormat(port: IGhostClientPort): Promise<boolean> {
    await port.waitReady()
    const config = port.clearReceived()
    if (config && "isPlainText" in config && typeof config.isPlainText === "boolean") {
      return config.isPlainText
    }
    throw new Error("email format not received")
  }

  handleMessage(message: string): MessagesFromBackground[keyof MessagesFromBackground] {
    console.info({ message })

    if (message === "ping") {
      return response(message)
    } else {
      return "ok"
    }
  }

  private sendBody(port: IGhostClientPort, isPlainText: boolean): void {
    const body = (isPlainText ? this.body.textContent : this.body.innerHTML) ?? ""
    port.send({ body })
  }

  private applyEdit(body: string, isPlainText: boolean): void {
    if (isPlainText) {
      this.body.textContent = body
    } else {
      this.body.innerHTML = body
    }
  }

  private listen(): () => void {
    let body = this.body
    const disable = (e: Event): void => {
      e.preventDefault()
      body.blur()
    }
    const controller = new AbortController()
    const option = { signal: controller.signal }

    body.addEventListener("beforeinput", disable, option)
    body.addEventListener("paste", disable, option)
    body.addEventListener("cut", disable, option)
    body.addEventListener("drop", disable, option)
    body.addEventListener("dragover", disable, option)
    body.addEventListener("selectionchange", disable, option)

    body.style.background = "lightgray"

    controller.signal.addEventListener("abort", () => {
      body.style.removeProperty("background")
    })

    return (): void => controller.abort()
  }
}

function response(_message: "ping"): MessagesFromBackground["ping"] {
  return "pong"
}
