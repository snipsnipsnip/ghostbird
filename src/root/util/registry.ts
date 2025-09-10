import { CaseFoldingMap } from "../../util"
import type { IRegistry } from "./wire"

export function makeRegistry<Catalog>(): IRegistry<Catalog & { messenger: typeof globalThis.messenger }> {
  // Sneak `messenger` into the container as a constant
  return new CaseFoldingMap([["messenger", ["const", globalThis.messenger]]])
}
