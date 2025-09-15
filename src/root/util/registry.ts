import { CaseFoldingMap } from "../../util"
import type { IRegistry } from "./wire"

export function makeRegistry<Catalog>(): IRegistry<Catalog & { messenger: typeof globalThis.messenger }> {
  // Sneak `messenger` into the container as a constant
  return new CaseFoldingMap([["messenger", ["const", globalThis.messenger]]])
}

export function makeRegistryWithBody<Catalog>(): IRegistry<
  Catalog & { messenger: typeof globalThis.messenger; body: HTMLBodyElement }
> {
  // Sneak `messenger` and `body` into the container as a constant
  return new CaseFoldingMap([
    ["messenger", ["const", globalThis.messenger]],
    ["body", ["const", globalThis.document.body]],
  ])
}
