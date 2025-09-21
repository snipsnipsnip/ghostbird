import type {
  EditorChangeResponse,
  EmailState,
  ExternalEdit,
  InternalEdit,
  ServerInitialResponse,
  UpdateRequest,
} from "./types"

export type SessionStatus = "unconnected" | "connecting" | "running" | "error" | "finished"

export type Command =
  | { type: "connect" }
  | { type: "queryEditor" }
  | { type: "requestUpdate"; update: UpdateRequest }
  | { type: "applyChange"; change: ExternalEdit | undefined }
  | { type: "notifyStatus"; status: SessionStatus }

export type CommandResult =
  | { type: "connected"; init: ServerInitialResponse }
  | { type: "statusUpdated" }
  | { type: "serverChanged"; change: EditorChangeResponse }
  | { type: "clientState"; state: EmailState }
  | { type: "clientEdited"; edit: InternalEdit }
  | { type: "disconnected"; error?: Error | undefined }
  | { type: "editorClosed" }

export class GhostTextClient {
  static isSingleton = true;

  *run(): Generator<Command, SessionStatus, CommandResult> {
    let res = yield { type: "notifyStatus", status: "connecting" }
    if (res?.type !== "statusUpdated") {
      return "error"
    }

    res = yield { type: "connect" }
    if (res?.type !== "connected") {
      return "error"
    }

    res = yield { type: "notifyStatus", status: "running" }
    if (res?.type !== "statusUpdated") {
      return "error"
    }

    res = yield { type: "queryEditor" }
    if (res?.type !== "clientState" || !res.state) {
      return "error"
    }

    while (res) {
      switch (res.type) {
        case "serverChanged":
          res = yield { type: "applyChange", change: makeChange(res.change) }
          continue
        case "clientEdited":
          res = yield { type: "requestUpdate", update: makePartialUpdate(res.edit) }
          continue
        case "clientState":
          res = yield { type: "requestUpdate", update: makeFullUpdate(res.state) }
          continue
      }
      return "finished"
    }
    return "error"
  }
}

function makeFullUpdate({ body, subject, selections, url }: EmailState): UpdateRequest {
  return {
    text: body,
    title: subject,
    url,
    selections,
    syntax: "",
  }
}

function makePartialUpdate(edit: InternalEdit): UpdateRequest {
  return {
    text: edit.body ?? "",
    title: "",
    url: "",
    selections: [],
    syntax: "",
  }
}

function makeChange(res: EditorChangeResponse): ExternalEdit | undefined {
  return res?.text == null ? undefined : { body: res.text }
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  describe(GhostTextClient, () => {
    it("should terminate if connection fails", () => {
      const sut = new GhostTextClient()
      const g = sut.run()

      g.next() // notifyStatus connecting
      g.next({ type: "statusUpdated" }) // connect

      expect(g.next({ type: "disconnected" })).to.deep.equal({ done: true, value: "error" })
    })

    it("should terminate if the initial editor state is not received", () => {
      const sut = new GhostTextClient()
      const g = sut.run()

      g.next() // notifyStatus connecting
      g.next({ type: "statusUpdated" }) // connect
      g.next({ type: "connected", init: initResponse }) // notifyStatus running
      expect(g.next({ type: "statusUpdated" }).value).to.deep.equal({ type: "queryEditor" } satisfies Command)

      expect(g.next({ type: "disconnected" }).done).to.be.true
    })

    it("should terminate if the editor is closed when queried for initial state", () => {
      const sut = new GhostTextClient()
      const g = sut.run()

      g.next() // notifyStatus connecting
      g.next({ type: "statusUpdated" }) // connect
      g.next({ type: "connected", init: initResponse }) // notifyStatus running
      g.next({ type: "statusUpdated" }) // queryEditor
      expect(g.next({ type: "editorClosed" }).done).to.be.true
    })

    it("should terminate when editor is closed during the session", () => {
      const sut = new GhostTextClient()
      const g = sut.run()
      runHandshake(g)

      // Editor closed, expect termination
      expect(g.next({ type: "editorClosed" }).done).to.be.true
    })

    it("should terminate when server disconnects during the session", () => {
      const sut = new GhostTextClient()
      const g = sut.run()
      runHandshake(g)

      // Session closed, expect termination
      expect(g.next({ type: "disconnected" }).done).to.be.true
    })

    it("should run a normal session and terminate on disconnect", () => {
      const sut = new GhostTextClient()
      const g = sut.run()
      runHandshake(g)

      // Server changes text, expect applyChange command
      const serverChange: EditorChangeResponse = { text: "Server changed text" }
      expect(g.next({ type: "serverChanged" as const, change: serverChange }).value).to.deep.equal({
        type: "applyChange" as const,
        change: { body: "Server changed text" },
      } satisfies Command)

      // After applying change, the client will wait for the next event.
      // Let's simulate a local editor content change, expect update request.
      const edit: InternalEdit = {
        body: "Editor changed text",
      }
      expect(g.next({ type: "clientEdited", edit }).value).to.deep.equal({
        type: "requestUpdate",
        update: makePartialUpdate(edit),
      } satisfies Command)

      // Disconnected, expect termination
      expect(g.next({ type: "disconnected" }).done).to.be.true
    })
  })

  // biome-ignore lint/style/useNamingConvention: required by the protocol
  const initResponse: ServerInitialResponse = { ProtocolVersion: 1, WebSocketPort: 1234 }

  const initialState: EmailState = {
    subject: "Test Subject",
    url: "example.com",
    isPlainText: true,
    body: "Initial text",
    selections: [],
  }

  /**
   * Brings the generator to the state where it's in the main event loop.
   * @param g the generator from `run()`
   */
  function runHandshake(g: Generator<Command, SessionStatus, CommandResult>): void {
    // 1. notifyStatus connecting
    expect(g.next().value).to.deep.equal({ type: "notifyStatus", status: "connecting" } satisfies Command)
    // 2. connect
    expect(g.next({ type: "statusUpdated" }).value).to.deep.equal({ type: "connect" } satisfies Command)
    // 3. notifyStatus running
    expect(g.next({ type: "connected", init: initResponse }).value).to.deep.equal({
      type: "notifyStatus",
      status: "running",
    } satisfies Command)
    // 4. queryEditor
    expect(g.next({ type: "statusUpdated" }).value).to.deep.equal({ type: "queryEditor" } satisfies Command)
    // 5. requestUpdate
    const initialUpdate = makeFullUpdate(initialState)
    expect(g.next({ type: "clientState", state: initialState }).value).to.deep.equal({
      type: "requestUpdate",
      update: initialUpdate,
    } satisfies Command)
  }
}
