import { readFile } from "node:fs/promises"
import { parse } from "@std/toml"
import type { EmittedAsset, Plugin } from "rolldown"
import type { LocaleId, LocalesTomlContent, MessagesJsonContent } from "src/util/types"

type Options = { path: string }

/** Generates _locales/<locale>/messages.json from the template file */
export const generateLocaleMessages = ({ path }: Options): Plugin => ({
  name: "generate_locale_messages",
  async generateBundle(): Promise<void> {
    let tomlId = await this.resolve(path)
    if (!tomlId) {
      this.warn(`${path} doesn't exist; skipping generation`)
      return
    }

    let locales = await loadLocaleToml(tomlId.id)
    let messagesByLocales = localeToMessages(locales)

    for (let [locale, messages] of messagesByLocales) {
      let dir = locale.replaceAll("-", "_")
      this.emitFile({
        type: "asset",
        fileName: `_locales/${dir}/messages.json`,
        originalFileName: tomlId.id,
        source: JSON.stringify(messages),
      } satisfies EmittedAsset)
    }
  },
})

/**
 * Converts a set of translations into WebExtension's locale messages.json format.
 */
function localeToMessages(toml: LocalesTomlContent): Map<LocaleId, MessagesJsonContent> {
  let langs = new Map<LocaleId, MessagesJsonContent>()
  for (const [messageId, translations] of Object.entries(toml)) {
    for (const [lang, msg] of Object.entries(translations)) {
      let content = langs.get(lang) ?? {}
      content[messageId] = typeof msg === "string" ? { message: msg } : msg
      langs.set(lang, content)
    }
  }
  return langs
}

/** Loads a TOML file that contains translations for various messages Ghostbird shows. */
export async function loadLocaleToml(tomlPath: string): Promise<LocalesTomlContent> {
  let tomlText = await readFile(tomlPath, { encoding: "utf8" })
  return parse(tomlText) as LocalesTomlContent
}
