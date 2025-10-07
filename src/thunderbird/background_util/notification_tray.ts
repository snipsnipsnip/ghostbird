import type { INotificationTray } from "src/ghosttext-adaptor"
import type { MessageId } from "src/util"
import type { ManifestInfo } from "."

export class NotificationTray implements INotificationTray {
  static isSingleton = true

  private title: string | undefined

  constructor(
    readonly messenger: typeof globalThis.messenger,
    readonly manifestInfo: ManifestInfo,
  ) {}

  async showNotification(iconUrl: string, messageId: MessageId): Promise<void> {
    await this.messenger.notifications.create(this.makeNotification(iconUrl, messageId))
  }

  private makeNotification(iconUrl: string, messageId: MessageId): messenger.notifications.CreateNotificationOptions {
    this.title ??= this.manifestInfo.getShortName()
    return {
      type: "basic",
      title: this.title,
      iconUrl,
      message: this.messenger.i18n.getMessage(messageId),
    }
  }
}
