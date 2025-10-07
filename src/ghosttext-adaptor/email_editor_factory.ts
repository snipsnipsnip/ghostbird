import { EmailEditor } from "src/ghosttext-adaptor/email_editor"
import type { IClientOptionsLoader } from "src/ghosttext-runner"
import type { IComposeWindow, IGhostServerPort, INotificationTray } from "."

export class EmailEditorFactory {
  static isSingleton = true

  constructor(
    private readonly clientOptionsLoader: IClientOptionsLoader,
    private readonly notificationTray: INotificationTray,
  ) {}

  async create(tab: IComposeWindow, port: IGhostServerPort): Promise<EmailEditor> {
    const options = await this.clientOptionsLoader.load()
    return new EmailEditor(this.notificationTray, tab, port, options)
  }
}
