import type { IGhostServerPort } from "src/app-background/api"
import type { ComposeDetails, IComposeWindow, SettableComposeDetails } from "src/ghosttext-adaptor/api"
import type { MessagesFromBackground } from "src/ghosttext-runner"
import type { IScriptingAPI } from "src/thunderbird"
import { PromisifiedPort } from "src/thunderbird/util/promisified_port"

export class ComposeTab implements IComposeWindow {
  constructor(
    readonly tabId: number,
    readonly tabs: typeof messenger.tabs,
    readonly scripting: IScriptingAPI,
    readonly compose: typeof messenger.compose,
    readonly composeAction: typeof messenger.composeAction,
  ) {}

  async prepareContentScript(): Promise<boolean> {
    console.info("Pinging the content script...")
    const defined = await this.send("ping").catch(() => {})
    if (defined) {
      console.info("Received pong.")
      return false
    }

    console.info("No pong. initializing...")

    const result = await this.scripting.executeScript({
      target: { tabId: this.tabId },
      injectImmediately: true,
      files: ["js/compose.js"],
    })
    console.log({ result })

    return true
  }

  async getDetails(): Promise<ComposeDetails> {
    let orig = await this.compose.getComposeDetails(this.tabId)
    let { isPlainText, subject, plainTextBody, body } = orig
    console.log({ orig })
    body = isPlainText ? plainTextBody : body

    return { isPlainText, subject, body } as ComposeDetails
  }

  setDetails({ subject }: SettableComposeDetails): Promise<void> {
    // TODO edit subject
    // TODO edit address lines
    let details: messenger.compose.ComposeDetails = { subject }

    return this.compose.setComposeDetails(this.tabId, details)
  }

  private send<const TType extends keyof MessagesFromBackground>(
    message: TType,
  ): Promise<MessagesFromBackground[TType]> {
    return this.tabs.sendMessage(this.tabId, message)
  }

  openPort(): IGhostServerPort {
    return PromisifiedPort.listenTo(this.tabs.connect(this.tabId))
  }

  setIcon(path: string): Promise<void> {
    return this.composeAction.setIcon({
      tabId: this.tabId,
      path,
    })
  }
}
