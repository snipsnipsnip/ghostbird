import type { IButtonMenu, IComposeWindowDetector, ITab, IUiUtil } from "src/app-background"
import * as appBackground from "src/app-background"
import { BackgroundEventRouter } from "src/app-background"
import * as appCompose from "src/app-compose"
import { ComposeEventRouter } from "src/app-compose"
import type {
  ComposeDetails,
  IGhostClientPort,
  IGhostServerPort,
  IManifestInfo,
  INotificationTray,
  IStoredOptionsLoader,
  IWebClient,
  StoredOptions,
} from "src/ghosttext-adaptor"
import * as ghosttextAdaptor from "src/ghosttext-adaptor"
import type { IHeart, IMessagePort } from "src/ghosttext-runner"
import * as ghosttextRunner from "src/ghosttext-runner"
import type { EditorChangeResponse, UpdateRequest } from "src/ghosttext-session"
import * as ghosttextSession from "src/ghosttext-session"
import type { BackgroundCatalog, ComposeCatalog } from "src/root/startup"
import { makeRegistry, type WirelessInjector, wireless } from "src/root/util"
import { promisifyMessageChannel } from "src/thunderbird/util"
import { describe, it, vi as jest } from "vitest"
import type OptionsSync from "webext-options-sync"

describe("Ghostbird", () => {
  it("should send initial text to server when started from toolbar", async ({ expect }) => {
    const sut = new Ghostbird()
    sut.startFromToolbar({ id: 42 })
    sut.composeBody.textContent = "hello"

    await expect(sut.sendsToServer()).resolves.to.be.deep.equal({
      text: "hello",
      title: "subject",
      url: "test-id.localhost",
      selections: [{ start: 0, end: 0 }],
      syntax: "",
    })

    await sut.closeSession()
  })

  it("should apply text from server to the compose body", async ({ expect }) => {
    const sut = new Ghostbird()
    sut.startFromToolbar({ id: 42 })
    sut.composeBody.textContent = "hello"

    await expect(sut.sendsToServer()).resolves.to.be.deep.equal({
      text: "hello",
      title: "subject",
      url: "test-id.localhost",
      selections: [{ start: 0, end: 0 }],
      syntax: "",
    })
    sut.receives("hello, world")
    await sut.closeSession()

    expect(sut.composeBody.textContent).equals("hello, world")
  })
})

/** Classes needed for the background router to work */
type MockedThunderbirdCatalog = {
  heart: IHeart
  buttonMenu: IButtonMenu
  composeTabDetector: IComposeWindowDetector
  uiUtil: IUiUtil
  manifestInfo: IManifestInfo
  notificationTray: INotificationTray
  storedOptionsLoader: IStoredOptionsLoader
  webClient: IWebClient
}

function makeMockedBackgroundInjector(
  mockedThunderbird: MockedThunderbirdCatalog,
): WirelessInjector<BackgroundCatalog> {
  let registry = makeRegistry({
    messenger: Symbol("messenger") as unknown as typeof globalThis.messenger,
    optionsSyncCtor: Symbol("optionsSyncCtor") as unknown as typeof OptionsSync,
    menuItems: [
      {
        icon: "",
        id: "stop_ghostbird",
        label: "stop",
      },
    ],
    ...mockedThunderbird,
  } as unknown as BackgroundCatalog)

  return wireless([appBackground, ghosttextSession, ghosttextAdaptor, ghosttextRunner], registry)
}

function makeMockedComposeInjector(): WirelessInjector<ComposeCatalog> {
  let registry = makeRegistry({
    messenger: Symbol("messenger") as unknown as typeof globalThis.messenger,
    body: document.body,
    selection: getSelection(),
    domParser: new DOMParser(),
  } as unknown as ComposeCatalog)

  return wireless([appCompose], registry)
}

/** Build a mock/stub of the Thunderbird API for testing purposes. */
function makeMockedThunderbird(
  composeWindowPort: IMessagePort<object, object>,
  webSocketPort: IMessagePort<string, string>,
): MockedThunderbirdCatalog {
  return {
    heart: {
      startBeat: jest.fn().mockReturnValue(jest.fn()),
    },
    composeTabDetector: {
      tryWrap: jest.fn().mockReturnValue({
        tabId: 123456789,
        prepareContentScript: jest.fn(),
        getDetails: jest.fn().mockResolvedValue({
          isPlainText: true,
          subject: "subject",
          body: "this initial text will be ignored",
        } as ComposeDetails),
        setDetails: jest.fn(),
        openPort: jest.fn().mockReturnValue(composeWindowPort),
        setIcon: jest.fn(),
      }),
    },
    storedOptionsLoader: {
      load: jest.fn().mockResolvedValue({
        serverPort: 12345,
        enableNotifications: false,
      } as StoredOptions),
    },
    manifestInfo: {
      getId: jest.fn().mockReturnValue("test-id"),
    },
    webClient: {
      getJson: jest.fn().mockResolvedValue({
        // biome-ignore-start lint/style/useNamingConvention: required by protocol spec
        ProtocolVersion: 1,
        WebSocketPort: 54321,
        // biome-ignore-end lint/style/useNamingConvention: required by protocol spec
      } as ghosttextSession.ServerInitialResponse),
      openWebSocket: jest.fn().mockReturnValue(webSocketPort),
    },
    buttonMenu: Symbol("buttonMenu") as unknown as IButtonMenu,
    notificationTray: Symbol("notificationTray") as unknown as INotificationTray,
    uiUtil: Symbol("uiUtil") as unknown as IUiUtil,
  } satisfies MockedThunderbirdCatalog
}

class Ghostbird {
  readonly composeBody: HTMLBodyElement
  private readonly backgroundRouter: BackgroundEventRouter
  private readonly composeRouter: ComposeEventRouter
  private readonly serverSocket: IMessagePort<string, string>
  private readonly backgroundToCompose: IGhostClientPort
  private session: Promise<void> | undefined

  constructor() {
    let [backgroundToCompose, composeToBackground]: [IGhostClientPort, IGhostServerPort] = promisifyMessageChannel(
      new MessageChannel(),
    )
    let [clientSocket, serverSocket] = promisifyMessageChannel<string, string>(new MessageChannel())
    let composeInjector = makeMockedComposeInjector()
    let mockedThunderbird = makeMockedThunderbird(composeToBackground, clientSocket)
    let backgroundInjector = makeMockedBackgroundInjector(mockedThunderbird)

    this.backgroundToCompose = backgroundToCompose
    this.serverSocket = serverSocket
    this.composeBody = composeInjector(Object, ["body"]) as unknown as HTMLBodyElement
    this.composeRouter = composeInjector(ComposeEventRouter)
    this.backgroundRouter = backgroundInjector(BackgroundEventRouter)
  }

  startFromToolbar(tab: ITab): void {
    const backgroundPromise = this.backgroundRouter.handleComposeAction(tab)
    const composePromise = this.composeRouter.handleConnect(this.backgroundToCompose)

    if (this.session) {
      throw Error("Session already started")
    }

    this.session = Promise.all([backgroundPromise, composePromise]).then(() => {})
  }

  receives(text: string): void {
    this.serverSocket.send(
      JSON.stringify({
        text,
        selections: [{ start: 0, end: 0 }],
      } satisfies EditorChangeResponse),
    )
  }

  async sendsToServer(): Promise<UpdateRequest | undefined> {
    await this.serverSocket.waitReady()
    const received = this.serverSocket.clearReceived()

    return typeof received === "string" ? JSON.parse(received as string) : received
  }

  async closeSession(): Promise<void> {
    this.serverSocket.close()
    await this.session
  }
}
