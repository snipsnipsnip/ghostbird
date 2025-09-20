import type { ClientStatus, ExternalEdit, IClientEditor, InternalEdit, IStatusIndicator } from "src/ghosttext-runner"
import type { EmailState } from "src/ghosttext-session"
import type { IComposeWindow, IGhostServerPort } from "./api"

export class EmailEditor implements IClientEditor, IStatusIndicator {
  constructor(
    readonly composeWindow: IComposeWindow,
    readonly port: IGhostServerPort,
  ) {}

  update(status: ClientStatus): Promise<void> {
    return this.composeWindow.setIcon(imageForStatus(status))
  }

  async getState(): Promise<EmailState> {
    let { body, subject, isPlainText } = await this.composeWindow.getDetails()

    // Expect body from the compose window
    await this.waitEdit()
    let r = this.port.clearReceived()
    if (isPlainText && r && "plainText" in r && r.plainText != null) {
      body = r.plainText
    } else if (!isPlainText && r && "html" in r && r.html != null) {
      body = r.html
    }

    // TODO Add an option to strip HTML tags on edit
    // TODO pass a better url that identify the email

    let { host } = new URL(import.meta.url)

    return { selections: [{ start: 0, end: 0 }], subject, isPlainText, body, url: host }
  }

  async applyChange(change: ExternalEdit): Promise<void> {
    // TODO Should re-add HTML tags like `<p></p>` if stripped
    this.port.send(change)
  }

  waitEdit(): Promise<void> {
    return this.port.waitReady()
  }

  popLastEdit(): InternalEdit | undefined {
    let edits = this.port.clearReceived()
    return edits
  }
}

function imageForStatus(status: ClientStatus): string {
  switch (status) {
    case "active":
      return "blue.svg"
    case "inactive":
      return "gray.svg"
    case "error":
      return "red.svg"
  }
}
