import type { MessageId } from "src/util"

export interface I18n {
  /**
   * Gets the localized string for the specified message. If the message is
   * missing, this method returns an empty string (''). If the format of
   * the `getMessage()` call is wrong — for example, _messageName_ is not a
   * string or the _substitutions_ array has more than 9 elements — this
   * method returns `undefined`.
   *
   * @param messageName The name of the message, as specified in the
   * `messages.json` file.
   *
   * @param [substitutions] Substitution strings, if the message requires
   * any.
   *
   * @returns Message localized for current locale.
   */
  getMessage(messageName: MessageId): string
}
