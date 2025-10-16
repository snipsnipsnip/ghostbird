import type { INotificationTray } from "src/ghosttext-adaptor"
import type { MessageId } from "src/util"
import type { ManifestInfo } from "."

/** Wraps the Notification API */
export class NotificationTray implements INotificationTray {
  static isSingleton = true

  /** Maximum number of notifications to show simultaneously */
  private readonly slotCount = 5
  private lastId = 0
  private title: string | undefined

  constructor(
    readonly messenger: typeof globalThis.messenger,
    readonly manifestInfo: ManifestInfo,
  ) {}

  async showNotification(iconUrl: string, messageId: MessageId): Promise<void> {
    const opts = this.makeNotification(iconUrl, messageId)
    await this.messenger.notifications.create(this.makeId(), opts)
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

  private makeId(): string {
    this.lastId = (this.lastId + 1) % this.slotCount
    return `NotificationTray-${this.lastId}`
  }
}
