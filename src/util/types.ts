/** Represents content of `locales.toml` */
export type LocalesTomlContent = Record<MessageId, Record<LocaleId, MessageLabel | { message: MessageLabel }>>

/**
 * Represents content of `messages.json` which is generated from `locales.toml` at build time,
 * and contains translated messages for a specific language.
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/i18n/Locale-Specific_Message_reference
 */
export type MessagesJsonContent = Record<MessageId, { message: MessageLabel }>

/**
 * An id of a language or a dialect.
 * @see https://developer.mozilla.org/en-US/docs/Glossary/BCP_47_language_tag
 */
export type LocaleId = string

/**
 * An id of a message that Ghostbird shows to the user.
 * Mostly in the form of `${The name of the file the message appears}_${English message}`.
 * example: `options_enable_notifications`
 */
export type MessageId = string

/** A translated message text shown to the user. example: `Enable notifications` */
export type MessageLabel = string
