import { readFile } from "node:fs/promises"
import { parse } from "@std/toml"
import type { EmittedAsset, Plugin } from "rolldown"

type Options = { path: string }

/** Generates _locales/<lang>/messages.json from the template file */
export const generateLocaleMessages = ({ path }: Options): Plugin => ({
  name: "generate_locale_messages",
  async generateBundle(): Promise<void> {
    let tomlId = await this.resolve(path)
    if (!tomlId) {
      this.warn(`${path} doesn't exist; skipping generation`)
      return
    }

    let messagesByLocales = await makeMessagesJson(tomlId.id)

    for (let [locale, messages] of messagesByLocales) {
      this.emitFile({
        type: "asset",
        fileName: `_locales/${locale}/messages.json`,
        originalFileName: tomlId.id,
        source: JSON.stringify(messages),
      } satisfies EmittedAsset)
    }
  },
})

type LanguageId = string
type MessageId = string
type MessageLabel = string
type MessagesJsonContent = Record<MessageId, { message: MessageLabel }>
type LocaleTomlContent = Record<MessageId, Record<LanguageId, MessageLabel>>

function localeToMessages(toml: LocaleTomlContent): Map<LanguageId, MessagesJsonContent> {
  let langs = new Map<LanguageId, MessagesJsonContent>()
  for (const [messageId, translations] of Object.entries(toml)) {
    for (const [lang, msg] of Object.entries(translations)) {
      let content = langs.get(lang) ?? {}
      content[messageId] = { message: msg }
      langs.set(lang, content)
    }
  }
  return langs
}

async function makeMessagesJson(tomlPath: string): Promise<Map<LanguageId, MessagesJsonContent>> {
  let tomlText = await readFile(tomlPath, { encoding: "utf8" })
  let tomlContent = parse(tomlText) as LocaleTomlContent

  return localeToMessages(tomlContent)
}
