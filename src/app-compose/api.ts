import type { IMessenger } from "src/ghosttext-runner/message"

export type { IGhostClientPort } from "src/ghosttext-adaptor/api"

/** Can send one-off messages to background */
export type IBackgroundMessenger = IMessenger<{ ping: "pong" }>
