import { EmailEditor } from "src/ghosttext-adaptor/email_editor"
import type { IClientOptionsLoader } from "src/ghosttext-runner"
import type { IComposeWindow, IGhostServerPort } from "."

export class EmailEditorFactory {
  static isSingleton = true

  constructor(private readonly clientOptionsLoader: IClientOptionsLoader) {}

  async create(tab: IComposeWindow, port: IGhostServerPort): Promise<EmailEditor> {
    const options = await this.clientOptionsLoader.load()
    return new EmailEditor(tab, port, options)
  }
}
