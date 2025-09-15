/**
 * @file Data shapes defined in https://github.com/fregante/GhostText/blob/v1.2.4/PROTOCOL.md
 */

export type ServerResponse = ServerInitialResponse | EditorChangeResponse
export type ClientRequest = UpdateRequest

// biome-ignore-start lint/style/useNamingConvention: required by protocol spec
/**
 * Response from a GhostText server on initial GET.
 */
export type ServerInitialResponse = {
  /** The protocol version. currently one */
  ProtocolVersion: number
  /** The port for the listening WebSocket. This ideally is the same configured HTTP port (default 4001) but it doesn't have to be. */
  WebSocketPort: number
}
// biome-ignore-end lint/style/useNamingConvention: end

/**
 * The user's current cursor selections in the editor.
 */
export type SelectionObject = {
  /** 0-index start of the selection in UTF-16 code units */
  start: number
  /** 0-index end of the selection in UTF-16 code units */
  end: number
}

/**
 * Message sent from the client to the server when the user makes a change in the browser.
 */
export type UpdateRequest = {
  /** The title of the document */
  title: string
  /** The host of the document's URL */
  url: string
  /** Not used. Is empty string in current implementations */
  syntax: ""
  /** The value of the textarea/content */
  text: string
  /** An array of selection objects that describe the user's current cursor selections in the editor */
  selections: ReadonlyArray<SelectionObject>
}

/**
 * Message received from the server to the client when the user makes a change in the editor.
 * At least one property has to be sent.
 */
export type EditorChangeResponse = {
  /** The temporary file content */
  text?: string
  /** An array of selection objects that describe the user's current cursor selections in the editor */
  selections?: ReadonlyArray<SelectionObject>
}

/** State of compose window relevant to GhostText */
export type EmailState = {
  /** Subject of the email */
  subject: string
  /** Extension ID */
  url: string
  /** Email format */
  isPlainText: boolean
  /** Email body which is either in HTML or plain text */
  body: string
  /** An array of selection objects that describe the user's current cursor selections in the editor. TODO: Always empty until v2.0.0 */
  selections: ReadonlyArray<SelectionObject>
}

/** Edits from the external text editor (the GhostText server) */
export type ExternalEdit = BodyState

/** Edits from the email compose window (the GhostText client) */
export type InternalEdit = { body: string } | BodyState

/** Email text in the compose window */
export type BodyState = { plainText?: string | undefined; html?: string | undefined }
