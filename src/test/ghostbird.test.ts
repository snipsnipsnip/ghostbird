import type { IButtonMenu, IComposeWindowDetector, IUiUtil } from "src/app-background"
import * as appBackground from "src/app-background"
import { BackgroundEventRouter } from "src/app-background"
import * as appCompose from "src/app-compose"
import { ComposeEventRouter } from "src/app-compose"
import type {
  BackgroundMessage,
  BodyState,
  ComposeDetails,
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
import type { EditorChangeResponse } from "src/ghosttext-session"
import * as ghosttextSession from "src/ghosttext-session"
import type { BackgroundCatalog, ComposeCatalog } from "src/root/startup"
import { makeRegistry, type WirelessInjector, wireless } from "src/root/util"
import { promisifyMessageChannel } from "src/thunderbird/util"
import { describe, it, vi as jest } from "vitest"
import type OptionsSync from "webext-options-sync"

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

describe("Ghostbird", () => {
  it("should send and receive texts and apply them to the compose body", async ({ expect }) => {
    let [backgroundPort, composePort] = promisifyMessageChannel<BackgroundMessage, BodyState>(new MessageChannel())
    let [clientWS, serverWS] = promisifyMessageChannel<string, string>(new MessageChannel())
    let composeInjector = makeMockedComposeInjector()
    let composeBody = composeInjector(Object, ["body"]) as unknown as HTMLBodyElement
    let composeRouter = composeInjector(ComposeEventRouter)
    let bgInjector = makeMockedBackgroundInjector(backgroundPort, clientWS)
    let sut = bgInjector(BackgroundEventRouter)
    composeBody.textContent = "hello"

    const backgroundPromise = sut.handleComposeAction({ id: 42 })
    const composePromise = composeRouter.handleConnect(composePort)
    await expect(serverWS.waitReady()).resolves.toBeUndefined()
    const responses: string[] = []
    responses.push(serverWS.clearReceived() as string)
    serverWS.send(
      JSON.stringify({
        text: "hello, world",
        selections: [{ start: 5, end: 5 }],
      } satisfies EditorChangeResponse),
    )
    serverWS.close()
    let closePromise = Promise.all([backgroundPromise, composePromise]).then(() => {})

    await expect(closePromise).resolves.toBeUndefined()
    expect(responses.map((str) => typeof str === "string" && JSON.parse(str))).deep.equals([
      {
        text: "hello",
        title: "subject",
        url: "test-id.localhost",
        selections: [{ start: 0, end: 0 }],
        syntax: "",
      },
    ])
    expect(composeBody.textContent).equals("hello, world")
  })
})

function makeMockedBackgroundInjector(
  composeWindowPort: IGhostServerPort,
  webSocketPort: IMessagePort<string, string>,
): WirelessInjector<BackgroundCatalog> {
  let registry = makeRegistry({
    messenger: Symbol("messenger") as unknown as typeof globalThis.messenger,
    optionsSyncCtor: Symbol("optionsSyncCtor") as unknown as typeof OptionsSync,
    menuItems: [],
    ...makeMockedThunderbird(composeWindowPort, webSocketPort),
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
