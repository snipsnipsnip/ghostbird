import { describe, expect, it } from "vitest"
import * as manifest from "../../manifest_template.json"
import { loadLocalesToml, loadOptionsCss, loadSourceTexts } from "./testutil"

describe("locales.toml", () => {
  it("should not have any unused message ids and vice versa", async () => {
    let [localeIds, cssIds, manifestIds, srcIds] = await Promise.all([
      loadIdsDefinedInLocales(),
      loadIdsUsedInCss(),
      loadIdsUsedInManifest(),
      loadIdsUsedInSource(),
    ])

    expect(localeIds.difference(cssIds).difference(manifestIds).difference(srcIds)).to.be.empty
    expect(srcIds.difference(localeIds)).to.be.empty
    expect(cssIds.difference(localeIds)).to.be.empty
    expect(manifestIds.difference(localeIds)).to.be.empty
  })
})

async function loadIdsUsedInSource(): Promise<Set<string>> {
  let ids = new Set<string>()
  for await (const id of collectIds(loadSourceTexts("../{root,ghosttext-adaptor}/**/*.ts"))) {
    ids.add(id)
  }
  return ids
}

async function loadIdsUsedInCss(): Promise<Set<string>> {
  return new Set(grepMsgIds(await loadOptionsCss()))
}

async function loadIdsUsedInManifest(): Promise<Set<string>> {
  return new Set(grepMsgIds(JSON.stringify(manifest)))
}

async function loadIdsDefinedInLocales(): Promise<Set<string>> {
  let locales = await loadLocalesToml()
  return new Set(Object.keys(locales))
}

function grepMsgIds(text: string): string[] {
  return Array.from(text.matchAll(/\b__MSG_(\w+)__/g), (match) => match[1] ?? "")
}

function grepSrcIds(text: string): string[] {
  return Array.from(text.matchAll(/"(src_\w+)/g), (match) => match[1] ?? "")
}

async function* collectIds(sources: AsyncIterable<string>): AsyncIterable<string> {
  for await (const text of sources) {
    yield* grepSrcIds(text)
  }
}
