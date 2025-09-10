import type { EditorChangeResponse, IEditorState, ServerInitialResponse, UpdateRequest } from "./types"

export type SessionStatus = "unconnected" | "connecting" | "running" | "error" | "finished"

export type Command =
  | { type: "connect" }
  | { type: "queryEditor" }
  | { type: "requestUpdate"; update: UpdateRequest }
  | { type: "applyChange"; change: EditorChangeResponse }
  | { type: "notifyStatus"; status: SessionStatus }

export type CommandResult =
  | { type: "connected"; init: ServerInitialResponse }
  | { type: "statusUpdated" }
  | { type: "serverChanged"; change: EditorChangeResponse }
  | { type: "editorState"; state: IEditorState }
  | { type: "partialEditorState"; state: Partial<IEditorState> }
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
      yield { type: "notifyStatus", status: "error" }
      return "error"
    }

    res = yield { type: "notifyStatus", status: "running" }
    if (res?.type !== "statusUpdated") {
      return "error"
    }

    res = yield { type: "queryEditor" }
    if (res?.type !== "editorState" || !res.state) {
      return "error"
    }
    let initialEditorState = res.state

    res = yield {
      type: "requestUpdate",
      update: makeInitialUpdate(initialEditorState),
    }

    while (res) {
      switch (res.type) {
        case "serverChanged":
          res = yield { type: "applyChange", change: res.change }
          continue
        case "partialEditorState":
        case "editorState":
          res = yield { type: "requestUpdate", update: makeUpdate(res.state) }
          continue
      }
      return "finished"
    }
    return "error"
  }
}

function makeInitialUpdate({ text, subject, selections, url }: IEditorState): UpdateRequest {
  return {
    text,
    title: subject,
    url,
    selections,
    syntax: "",
  }
}

function makeUpdate({ text, selections }: Partial<IEditorState>): UpdateRequest {
  return {
    text: text ?? "",
    title: "",
    url: "",
    selections: selections ?? [],
    syntax: "",
  }
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  describe(GhostTextClient, () => {
    it("should terminate if connection fails", () => {
      const sut = new GhostTextClient()
      const g = sut.run()

      g.next() // notifyStatus connecting
      g.next({ type: "statusUpdated" }) // connect

      expect(g.next({ type: "disconnected" }).value).to.deep.equal({ type: "notifyStatus", status: "error" })
      expect(g.next().done).to.be.true
    })

    it("should terminate if the initial editor state is not received", () => {
      const sut = new GhostTextClient()
      const g = sut.run()

      g.next() // notifyStatus connecting
      g.next({ type: "statusUpdated" }) // connect
      g.next({ type: "connected", init: initResponse }) // notifyStatus running
      expect(g.next({ type: "statusUpdated" }).value).to.deep.equal({ type: "queryEditor" })

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
      expect(g.next({ type: "serverChanged", change: serverChange }).value).to.deep.equal({
        type: "applyChange",
        change: serverChange,
      })

      // After applying change, the client will wait for the next event.
      // Let's simulate a local editor content change, expect update request.
      const editorState: IEditorState = {
        ...initialState,
        text: "Editor changed text",
      }
      expect(g.next({ type: "partialEditorState", state: editorState }).value).to.deep.equal({
        type: "requestUpdate",
        update: makeUpdate(editorState),
      })

      // Disconnected, expect termination
      expect(g.next({ type: "disconnected" }).done).to.be.true
    })
  })

  // biome-ignore lint/style/useNamingConvention: required by the protocol
  const initResponse: ServerInitialResponse = { ProtocolVersion: 1, WebSocketPort: 1234 }

  const initialState: IEditorState = {
    subject: "Test Subject",
    url: "http://example.com",
    text: "Initial text",
    selections: [],
  }

  /**
   * Brings the generator to the state where it's in the main event loop.
   * @param g the generator from `run()`
   */
  function runHandshake(g: Generator<Command, SessionStatus, CommandResult>) {
    // 1. notifyStatus connecting
    expect(g.next().value).to.deep.equal({ type: "notifyStatus", status: "connecting" })
    // 2. connect
    expect(g.next({ type: "statusUpdated" }).value).to.deep.equal({ type: "connect" })
    // 3. notifyStatus running
    expect(g.next({ type: "connected", init: initResponse }).value).to.deep.equal({
      type: "notifyStatus",
      status: "running",
    })
    // 4. queryEditor
    expect(g.next({ type: "statusUpdated" }).value).to.deep.equal({ type: "queryEditor" })
    // 5. requestUpdate
    const initialUpdate = makeInitialUpdate(initialState)
    expect(g.next({ type: "editorState", state: initialState }).value).to.deep.equal({
      type: "requestUpdate",
      update: initialUpdate,
    })
  }
}
