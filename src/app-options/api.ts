import type { PromisifyingQueue } from "src/util"

/** A wrapper of `storage` API that holds all options  */
export interface IOptionsStore {
  /**
   * Any defaults or saved options will be loaded into the `<form>` and any change will automatically be saved to storage
   * @param form The `<form>` that needs to be synchronized. The form fields' `name` attributes will have to match the option names.
   * @returns an async message queue that notifies when the option is changed and saved
   */
  syncForm(form: HTMLFormElement): Promise<PromisifyingQueue<"saved" | "error">>
}
