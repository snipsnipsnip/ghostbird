import type { IHeart } from "src/ghosttext-runner"
import type { Alarm } from "src/thunderbird"

/** Tries to prevent background script from MV3 suspension of the background script */
export class AlarmHeart implements IHeart {
  /** Should be set if the onAlarm listener has been registered */
  private isListenerReady = false

  constructor(readonly messenger: typeof globalThis.messenger) {}

  /**
   * Should be called after the onAlarm listener has been registered.
   * Due to MV3 restriction, the event listener must be registered at the toplevel.
   */
  ready(registeredCallback: (alarm: Alarm) => void): void {
    this.isListenerReady = this.messenger.alarms.onAlarm.hasListener(registeredCallback)
  }

  startBeat(): () => void {
    console.assert(this.isListenerReady)
    this.messenger.alarms.create("heart", {
      periodInMinutes: 1,
    })

    return (): boolean => this.messenger.alarms.clear("heart")
  }
}
