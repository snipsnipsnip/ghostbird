import type { IGhostServerPort } from "src/app-background/api"
import type { ComposeDetails, IComposeWindow, SettableComposeDetails } from "src/ghosttext-adaptor/api"
import type { MessagesFromBackground } from "src/ghosttext-runner"
import type { IScriptingAPI } from "src/thunderbird"
import { PromisifiedPort } from "src/thunderbird/util/promisified_port"

export class ComposeTab implements IComposeWindow {
  constructor(
    private readonly id: number,
    private readonly tabs: typeof messenger.tabs,
    private readonly scripting: IScriptingAPI,
    private readonly compose: typeof messenger.compose,
    private readonly composeAction: typeof messenger.composeAction,
  ) {}

  get tabId(): number {
    return this.id
  }

  async prepareContentScript(): Promise<boolean> {
    console.info("Pinging the content script...")
    const defined = await this.send("ping").catch(() => {})
    if (defined) {
      console.info("Received pong.")
      return false
    }

    console.info("No pong. initializing...")

    const result = await this.scripting.executeScript({
      target: { tabId: this.id },
      injectImmediately: true,
      files: ["js/compose.js"],
    })
    console.log({ result })

    return true
  }

  async getDetails(): Promise<ComposeDetails> {
    let orig = await this.compose.getComposeDetails(this.id)
    let { isPlainText, subject, plainTextBody, body } = orig
    console.log({ orig })
    body = isPlainText ? plainTextBody : body

    return { isPlainText, subject, body } as ComposeDetails
  }

  setDetails({ subject }: SettableComposeDetails): Promise<void> {
    // TODO edit subject
    // TODO edit address lines
    let details: messenger.compose.ComposeDetails = { subject }

    return this.compose.setComposeDetails(this.id, details)
  }

  private send<const TType extends keyof MessagesFromBackground>(
    message: TType,
  ): Promise<MessagesFromBackground[TType]> {
    return this.tabs.sendMessage(this.id, message)
  }

  openPort(): IGhostServerPort {
    return PromisifiedPort.listenTo(this.tabs.connect(this.id))
  }

  setIcon(path: string): Promise<void> {
    return this.composeAction.setIcon({
      tabId: this.id,
      path,
    })
  }
}
