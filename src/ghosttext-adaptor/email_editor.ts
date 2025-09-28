import type {
  ClientOptions,
  ClientStatus,
  ExternalEdit,
  IClientEditor,
  InternalEdit,
  IStatusIndicator,
} from "src/ghosttext-runner"
import type { EmailState } from "src/ghosttext-session"
import type { IComposeWindow, IGhostServerPort } from "./api"

export class EmailEditor implements IClientEditor, IStatusIndicator {
  constructor(
    private readonly composeWindow: IComposeWindow,
    private readonly port: IGhostServerPort,
    private readonly options: ClientOptions,
  ) {}

  update(status: ClientStatus): Promise<void> {
    return this.composeWindow.setIcon(imageForStatus(status))
  }

  async getState(): Promise<EmailState> {
    let { body, subject, isPlainText } = await this.composeWindow.getDetails()

    this.port.send({ isPlainText })

    // Expect body from the compose window
    await this.waitEdit()
    const r = this.port.clearReceived()
    if (r?.body != null) {
      body = r.body
    }

    // TODO Add an option to strip HTML tags on edit

    let url = this.options.clientHostName
    return { selections: [{ start: 0, end: 0 }], subject, isPlainText, body, url }
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
