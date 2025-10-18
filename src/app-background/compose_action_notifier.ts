import type { EmailEditorFactory, IComposeWindow, IGhostServerPort } from "src/ghosttext-adaptor"
import type { GhostTextStarter } from "src/ghosttext-runner"

/** Responsible for interacting with compose windows */
export class ComposeActionNotifier {
  static isSingleton = true
  private readonly runners = new Map<number, IGhostServerPort>()

  constructor(
    private readonly ghostTextStarter: GhostTextStarter,
    private readonly emailEditorFactory: EmailEditorFactory,
  ) {}

  async start(tab: IComposeWindow): Promise<void> {
    if (this.findOpenPort(tab)) {
      console.info("Port is already open; skipping")
      return
    }
    await tab.prepareContentScript()

    const port = tab.openPort()
    this.runners.set(tab.tabId, port)

    try {
      console.info("starting session")
      const editor = await this.emailEditorFactory.create(tab, port)
      await this.ghostTextStarter.run(editor, editor)
    } finally {
      console.info("session closed")
      this.close(tab, port)
    }
  }

  async stop(tab: IComposeWindow): Promise<void> {
    this.close(tab, this.runners.get(tab.tabId))
  }

  async toggle(tab: IComposeWindow): Promise<void> {
    let port = this.findOpenPort(tab)
    if (port) {
      console.info("toggle: closing")
      this.close(tab, port)
    } else {
      console.info("toggle: starting")
      await this.start(tab)
    }
  }

  private close({ tabId }: IComposeWindow, port: IGhostServerPort | undefined): void {
    this.runners.delete(tabId)
    port?.close()
  }

  private findOpenPort({ tabId }: IComposeWindow): IGhostServerPort | undefined | false {
    let port = this.runners.get(tabId)
    return port?.isOpen() && port
  }
}
