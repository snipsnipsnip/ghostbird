/**
 * @file `messenger.alarms` API somehow missing in the type lib
 * @see https://webextension-api.thunderbird.net/en/esr-mv3/alarms.html
 */

/** Use the scripting API to execute script in different contexts. */
export interface IAlarmsAPI {
  /**
   * Clears the alarm with the given name.
   * @param name The name of the alarm to clear. Defaults to the empty string.
   * @returns Whether an alarm of the given name was found to clear.
   */
  clear(name?: string): boolean

  /**
   * Creates an alarm. After the delay is expired, the onAlarm event is fired. If there is another alarm with the same name (or no name if none is specified), it will be cancelled and replaced by this alarm.
   * @param name Optional name to identify this alarm. Defaults to the empty string.
   * @param alarmInfo Details about the alarm. The alarm first fires either at `when` milliseconds past the epoch (if `when` is provided), after `delayInMinutes` minutes from the current time (if `delayInMinutes` is provided instead), or after `periodInMinutes` minutes from the current time (if only `periodInMinutes` is provided). Users should never provide both `when` and `delayInMinutes`. If `periodInMinutes` is provided, then the alarm recurs repeatedly after that many minutes.
   */
  create(name: string, alarmInfo: Partial<AlarmInfo>): void
  create(alarmInfo: AlarmInfo): void

  /** Fired when an alarm has expired. Useful for transient background pages. */
  readonly onAlarm: WebExtEvent<(name: Alarm) => void>
}

/**
 * Details about the alarm.
 */
export type AlarmInfo = {
  /** Number of minutes from the current time after which the alarm should first fire.*/ delayInMinutes: number
  /** Number of minutes after which the alarm should recur repeatedly. */
  periodInMinutes: number
  /** Time when the alarm is scheduled to first fire, in milliseconds past the epoch. */
  when: number
}

/** The alarm that has expired. */
export type Alarm = {
  /** Name of this alarm. */
  name: string
  /** Time when the alarm is scheduled to fire, in milliseconds past the epoch.*/
  scheduledTime: number
  /** When present, signals that the alarm triggers periodically after so many minutes. */
  periodInMinutes: number | undefined
}
