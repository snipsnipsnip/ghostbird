import type { IMessenger } from "../ghosttext-runner/message"

export type { IGhostClientPort } from "../ghosttext-adaptor/api"

/** Can send one-off messages to background */
export type IBackgroundMessenger = IMessenger<{ ping: "pong" }>
