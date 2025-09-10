import type { Command, CommandResult, GhostTextClient, SessionStatus } from "../ghosttext-session/ghost_text_client"
import type {
  ClientStatus,
  IClientEditor,
  IClientOptions,
  IGhostTextConnector,
  IHeart,
  ISession,
  IStatusIndicator,
} from "./api"

export class GhostTextRunner {
  static isSingleton = true

  constructor(
    private readonly ghostTextConnector: IGhostTextConnector,
    private readonly clientOptions: IClientOptions,
    private readonly ghostTextClient: GhostTextClient,
    private readonly heart: IHeart,
  ) {}

  async run(statusIndicator: IStatusIndicator, editor: IClientEditor): Promise<void> {
    let stopHeartbeat = this.heart.startBeat()
    let session: ISession | undefined
    let command: IteratorResult<Command, SessionStatus> | undefined
    try {
      const g = this.ghostTextClient.run()
      command = g.next()

      while (!command.done && command.value.type !== "queryEditor") {
        let [r, s] = await this.runHandshakeCommand(statusIndicator, command.value)

        session ??= s

        command = g.next(r)
      }

      if (!session) {
        return
      }

      while (!command.done) {
        let result = await this.runSessionCommand(statusIndicator, editor, session, command.value)

        command = g.next(result)
      }
    } finally {
      console.log("generator finished")
      let lastStatus = command?.done ? translateStatus(command.value) : "error"

      // TODO send the last update before closing
      session?.close()
      await statusIndicator.update(lastStatus).catch(() => {})
      stopHeartbeat()
    }
  }

  async runHandshakeCommand(
    indicator: IStatusIndicator,
    command: Command,
  ): Promise<[CommandResult] | [CommandResult, ISession]> {
    switch (command.type) {
      case "connect":
        try {
          let [session, initRes] = await this.ghostTextConnector.connect(this.clientOptions.serverUrl)
          return [{ type: "connected", init: initRes }, session]
        } catch (e) {
          return [{ type: "disconnected", error: e as Error }]
        }
      case "notifyStatus":
        await indicator.update(translateStatus(command.status))
        return [{ type: "statusUpdated" }]
      case "queryEditor":
      case "requestUpdate":
      case "applyChange":
        return [{ type: "disconnected", error: Error("unexpected command") }]
    }
    // We don't handle default here so that tsc checks for exhaustiveness
  }

  async runSessionCommand(
    indicator: IStatusIndicator,
    editor: IClientEditor,
    session: ISession,
    command: Command,
  ): Promise<CommandResult> {
    switch (command.type) {
      case "queryEditor":
        return { type: "editorState", state: await editor.getState() }
      case "requestUpdate":
        session.sendUpdate(command.update)
        return receiveChange(editor, session)
      case "applyChange":
        await editor.applyChange(command.change)
        return receiveChange(editor, session)
      case "notifyStatus":
        await indicator.update(translateStatus(command.status))
        return { type: "statusUpdated" }
      case "connect":
        return { type: "disconnected", error: Error("unexpected command") }
    }
    // We don't handle default here so that tsc checks for exhaustiveness
  }
}

async function receiveChange(editor: IClientEditor, session: ISession): Promise<CommandResult> {
  for (;;) {
    let change = await receiveChangeOnce(editor, session)
    if (change) {
      return change
    }
    console.log("retrying")
  }
}

async function receiveChangeOnce(editor: IClientEditor, session: ISession): Promise<CommandResult | undefined> {
  let type = await Promise.race([
    editor.waitEdit().then(
      () => "partialEditorState" as const,
      () => "editorClosed" as const,
    ),
    session.waitServerChange().then(
      () => "serverChanged" as const,
      () => "disconnected" as const,
    ),
  ])

  if (type === "partialEditorState") {
    let state = editor.popLastEdit()
    return state && { type, state }
  } else if (type === "serverChanged") {
    let change = session.popServerChange()
    return change && { type, change }
  } else {
    return { type }
  }
}

function translateStatus(s: SessionStatus): ClientStatus {
  switch (s) {
    case "error":
      return "error"
    case "running":
      return "active"
    case "connecting":
    case "unconnected":
    case "finished":
      return "inactive"
  }
  // We don't handle default here so that tsc checks for exhaustiveness
}
