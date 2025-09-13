import type { ClientStatus, IClientEditor, IStatusIndicator } from "../ghosttext-runner"
import type { EditorChangeResponse, IEditorState } from "../ghosttext-session"
import type { IComposeWindow, IGhostServerPort } from "./api"

export class EmailEditor implements IClientEditor, IStatusIndicator {
  constructor(
    readonly composeWindow: IComposeWindow,
    readonly port: IGhostServerPort,
  ) {}

  update(status: ClientStatus): Promise<void> {
    return this.composeWindow.setIcon(imageForStatus(status))
  }

  async getState(): Promise<IEditorState> {
    this.port.clearReceived()

    let { body, subject } = await this.composeWindow.getDetails()

    // TODO Add an option to strip HTML tags on edit
    // TODO pass a better url that identify the email

    let { host } = new URL(import.meta.url)

    return { selections: [{ start: 0, end: 0 }], subject, text: body, url: host }
  }

  async applyChange(change: EditorChangeResponse): Promise<void> {
    // TODO Should re-add HTML tags like `<p></p>` if stripped
    if (change.text) {
      this.port.send(change)
    }
  }

  waitEdit(): Promise<void> {
    return this.port.waitReady()
  }

  popLastEdit(): Partial<IEditorState> | undefined {
    return this.port.clearReceived()
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
