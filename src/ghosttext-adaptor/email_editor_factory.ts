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
    let tray = options.enableNotifications ? this.notificationTray : new NullNotificationTray()

    return new EmailEditor(tray, tab, port, options)
  }
}

class NullNotificationTray implements INotificationTray {
  async showNotification(): Promise<void> {}
}
