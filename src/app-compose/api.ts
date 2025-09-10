import type { IMessagePort, IMessenger } from "../ghosttext-runner/message"
import type { EditorChangeResponse, IEditorState } from "../ghosttext-session"

/** Connection to the background script, and the GhostText server behind it */
export type IGhostClientPort = IMessagePort<Partial<IEditorState>, EditorChangeResponse>

/** Can send one-off messages to background */
export type IBackgroundMessenger = IMessenger<{ ping: "pong" }>
