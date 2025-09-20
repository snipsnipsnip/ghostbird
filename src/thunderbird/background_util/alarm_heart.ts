import type { IHeart } from "src/ghosttext-runner"

export class AlarmHeart implements IHeart {
  static isSingleton = true
  static aliases = "heart"

  /** Should be set if the onAlarm listener has been registered */
  private isListenerReady = false

  constructor(readonly messenger: typeof globalThis.messenger) {}

  assumeReady() {
    this.isListenerReady = true
  }

  startBeat(): () => void {
    console.assert(this.isListenerReady)
    this.messenger.alarms.create("heart", {
      periodInMinutes: 1,
    })

    return () => this.messenger.alarms.clear("heart")
  }
}
