/**
 * @file `messenger.scripting` API added at Thunderbird 128 ESR
 * @see https://webextension-api.thunderbird.net/en/128-esr-mv3/scripting.html
 */

import type { PlainJSONValue } from "./"

/** Use the scripting API to execute script in different contexts. */
export interface IScriptingAPI {
  /** Injects a script into a target context. The script will be run at document_idle. */
  executeScript(injection: ScriptInjection): Promise<unknown>
}

/** Details of a script injection */
export interface ScriptInjection {
  /** Details specifying the target into which to inject the script. */
  target: { tabId: number }

  /** The path of the JS files to inject, relative to the extension's root directory. Exactly one of files and func must be specified. */
  files?: string[]

  /** A JavaScript function to inject. This function will be serialized, and then deserialized for injection. This means that any bound parameters and execution context will be lost. Exactly one of files and func must be specified. */
  func?: (this: void, ...args: PlainJSONValue[]) => unknown

  /** The arguments to curry into a provided function. This is only valid if the func parameter is specified. These arguments must be JSON-serializable. */
  args?: PlainJSONValue[]

  /** Whether the injection should be triggered in the target as soon as possible (but not necessarily prior to page load). */
  injectImmediately?: boolean

  /** The JavaScript world for a script to execute within. ISOLATED is the default execution environment of content scripts, MAIN is the web page's execution environment. */
  world?: "ISOLATED" | "MAIN"
}

/** Result of a script injection. */
export interface InjectionResult {
  /** The frame ID associated with the injection. */
  frameId: number

  /** The error property is set when the script execution failed. The value is typically an (Error) object with a message property, but could be any value (including primitives and undefined) if the script threw or rejected with such a value. */
  error?: unknown

  /** The result of the script execution. */
  result?: unknown
}
