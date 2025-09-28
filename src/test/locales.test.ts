import { describe, expect, it } from "vitest"
import * as manifest from "../../manifest_template.json"
import { loadLocalesToml, loadOptionsCss } from "./testutil"

describe("locales.toml", () => {
  it("should not have any unused message ids and vice versa", async () => {
    let localeIds = await loadIdsDefinedInLocales()
    let cssIds = await loadIdsUsedInCss()
    let manifestIds = await loadIdsUsedInManifest()
    let allUsedIds = cssIds.union(manifestIds)

    expect(localeIds.difference(allUsedIds)).to.be.empty
    expect(cssIds.difference(localeIds)).to.be.empty
    expect(manifestIds.difference(localeIds)).to.be.empty
  })
})

async function loadIdsUsedInCss(): Promise<Set<string>> {
  return grepIds(await loadOptionsCss())
}

async function loadIdsUsedInManifest(): Promise<Set<string>> {
  return grepIds(JSON.stringify(manifest))
}

async function loadIdsDefinedInLocales(): Promise<Set<string>> {
  let locales = await loadLocalesToml()
  return new Set(Object.keys(locales))
}

function grepIds(text: string): Set<string> {
  return new Set(Array.from(text.matchAll(/\b__MSG_(\w+)__/g), (match) => match[1] ?? ""))
}
