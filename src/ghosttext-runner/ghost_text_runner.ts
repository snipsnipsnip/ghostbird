import type { Command, CommandResult, GhostTextSession, SessionStatus } from "src/ghosttext-session"
import type { ClientOptions, ClientStatus, IClientEditor, IGhostTextConnector, ISession, IStatusIndicator } from "./api"

export class GhostTextRunner {
  private command: IteratorResult<Command, SessionStatus> | undefined
  private session: ISession | undefined

  constructor(
    private readonly ghostTextConnector: IGhostTextConnector,
    private readonly options: ClientOptions,
    private readonly statusIndicator: IStatusIndicator,
    private readonly editor: IClientEditor,
  ) {}

  get lastStatus(): ClientStatus {
    return this.command?.done ? translateStatus(this.command.value) : "error"
  }

  close(): Promise<void> {
    this.session?.close()
    return this.statusIndicator.update(this.lastStatus)
  }

  async run(g: GhostTextSession): Promise<void> {
    this.command = g.next()

    while (!this.command.done && this.command.value.type !== "queryEditor") {
      let [r, s] = await this.runHandshakeCommand(this.command.value)

      this.session ??= s

      this.command = g.next(r)
    }

    if (!this.session) {
      return
    }

    while (!this.command.done) {
      let result = await this.runSessionCommand(this.session, this.command.value)

      this.command = g.next(result)
    }
  }

  async runHandshakeCommand(command: Command): Promise<[CommandResult, ISession?]> {
    switch (command.type) {
      case "connect":
        try {
          let [session, initRes] = await this.ghostTextConnector.connect(this.options.serverUrl)
          return [{ type: "connected", init: initRes }, session]
        } catch (e) {
          return [{ type: "disconnected", error: e as Error }]
        }
      case "notifyStatus":
        await this.statusIndicator.update(translateStatus(command.status))
        return [{ type: "statusUpdated" }]
      case "queryEditor":
      case "requestUpdate":
      case "applyChange":
        return [{ type: "disconnected", error: Error("unexpected command") }]
    }
    // We don't handle default here so that tsc checks for exhaustiveness
  }

  async runSessionCommand(session: ISession, command: Command): Promise<CommandResult> {
    switch (command.type) {
      case "queryEditor":
        return { type: "clientState", state: await this.editor.getState() }
      case "requestUpdate":
        session.sendUpdate(command.update)
        return receiveChange(this.editor, session)
      case "applyChange":
        if (command.change) {
          await this.editor.applyChange(command.change)
        }
        return receiveChange(this.editor, session)
      case "notifyStatus":
        await this.statusIndicator.update(translateStatus(command.status))
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

/**
 * Await a single event from the editor or the session and produce the corresponding command result.
 *
 * @param editor - Client editor used to wait for an edit and to pop the last edit when one occurs
 * @param session - Session used to wait for a server change and to pop the server change when one occurs
 * @returns A `CommandResult` describing the event:
 * - `{ type: "clientEdited", edit }` when an editor edit was produced
 * - `{ type: "serverChanged", change }` when a server change was produced
 * - `{ type: "editorClosed" }` when the editor closed without an edit
 * - `{ type: "disconnected" }` when the session disconnected without a change
 * - `undefined` if an edit/change event was signaled but no payload was available to include.
 */
async function receiveChangeOnce(editor: IClientEditor, session: ISession): Promise<CommandResult | undefined> {
  let type = await Promise.race([
    editor.waitEdit().then(
      () => "clientEdited" as const,
      () => "editorClosed" as const,
    ),
    session.waitServerChange().then(
      () => "serverChanged" as const,
      () => "disconnected" as const,
    ),
  ])

  if (type === "clientEdited") {
    let state = editor.popLastEdit()
    return state && { type, edit: state }
  } else if (type === "serverChanged") {
    let change = session.popServerChange()
    return change && { type, change }
  } else {
    return { type }
  }
}

/**
 * Map a connection status to a user-visible ClientStatus.
 */
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
