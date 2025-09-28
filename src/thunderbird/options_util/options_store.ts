import type { IStoredOptionsLoader, StoredOptions } from "src/ghosttext-adaptor"
import { PromisifyingQueue } from "src/util"
import OptionsSync from "webext-options-sync"

/** A wrapper of OptionsSync responsible for loading and saving options from storage */
export class OptionsStore implements IStoredOptionsLoader {
  static isSingleton = true
  static aliases = ["StoredOptionsLoader"]

  private readonly options = new OptionsSync<StoredOptions>({
    storageType: "local",
    defaults: {
      serverPort: 4001,
    },
  })

  load(): Promise<StoredOptions> {
    return this.options.getAll()
  }

  /**
   * Any defaults or saved options will be loaded into the `<form>` and any change will automatically be saved to storage
   * @param selector - The `<form>` that needs to be synchronized. The form fields' `name` attributes will have to match the option names.
   * @returns an async message queue that notifies when the option is changed and saved
   */
  async syncForm(form: HTMLFormElement): Promise<PromisifyingQueue<"saved" | "error">> {
    // Do a full clear of the options when the form is reset
    form.addEventListener("reset", async (e) => {
      try {
        e.preventDefault()
        await this.options.setAll(this.options.defaults)
        q.pushReceived("saved")

        // Restart sync to let OptionsStore update the form
        await this.options.syncForm(form)
      } catch {
        q.pushReceived("error")
      }
    })

    let q = new PromisifyingQueue<"saved" | "error">()
    form.addEventListener("options-sync:save-success", () => {
      q.pushReceived("saved")
    })
    form.addEventListener("options-sync:save-error", () => {
      q.pushReceived("error")
    })

    await this.options.syncForm(form)

    return q
  }

  /** Opens the browser’s file picker to import options from a previously-saved JSON file */
  importFromFile(): Promise<void> {
    return this.options.importFromFile()
  }

  /** Opens the browser’s "save file" dialog to export options to a JSON file */
  exportToFile(): Promise<void> {
    return this.options.exportToFile()
  }
}
