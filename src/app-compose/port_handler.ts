import type { IGhostClientPort } from "./api"
import type { BodyEditor } from "./body_editor"

export class PortHandler {
  static isSingleton = true

  constructor(readonly bodyEditor: BodyEditor) {}

  async handleConnect(port: IGhostClientPort): Promise<void> {
    console.info({ connected: Date.now(), date: new Date() })

    const isPlainText = await this.receiveFormat(port)

    this.sendBody(port, isPlainText)

    for (;;) {
      await port.waitReady()

      const got = port.clearReceived()
      if (!got || !("body" in got)) {
        break
      }
      this.bodyEditor.applyEdit(got.body, isPlainText)
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

  private sendBody(port: IGhostClientPort, isPlainText: boolean): void {
    const body = this.bodyEditor.getBody(isPlainText)
    port.send({ body })
  }
}
