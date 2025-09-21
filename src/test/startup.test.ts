import { toKebabCase } from "@std/text"
import * as appBackground from "src/app-background"
import * as appCompose from "src/app-compose"
import * as appOptions from "src/app-options"
import * as ghosttextAdaptor from "src/ghosttext-adaptor"
import * as ghosttextRunner from "src/ghosttext-runner"
import * as ghosttextSession from "src/ghosttext-session"
import { startup } from "src/root/startup"
import type { ResolveQuery } from "src/root/util/wire"
import * as thunderbird from "src/thunderbird"
import * as util from "src/util"
import { CaseFoldingSet } from "src/util"
import { describe, expect, test } from "vitest"
import { writeText } from "./testutil"

type AnyEntry = ResolveQuery<Record<string, unknown>, unknown>

class TestRegistry extends util.CaseFoldingMap<AnyEntry> {
  override set(key: string, value: AnyEntry): this {
    if (this.has(key)) {
      throw Error(`Duplicate registration for [${key}]`)
    }

    return super.set(key, value)
  }
}

const modules: Record<string, Record<string, unknown>> = {
  appOptions,
  ghosttextSession,
  appBackground,
  thunderbird,
  appCompose,
  ghosttextAdaptor,
  ghosttextRunner,
}

describe(startup, () => {
  test("All collected classes must be resolvable", () => {
    const registry = new TestRegistry([
      ["messenger", ["const", makeDummyMessenger()]],
      ["body", ["const", Symbol("body")]],
    ])
    const wire = startup(Object.values(modules), registry)

    // TODO test handling of name clash across modules
    let all = wire(Array, registry.keys()) as unknown[]

    expect(all).has.length(registry.size)
    expect(all.every((x) => x)).toBeTruthy()
  })

  test("All collected classes won't use given dependency immediately in constructor", async () => {
    const registry = new Map<string, AnyEntry>([
      ["messenger", ["const", Symbol("messenger")]],
      ["body", ["const", Symbol("body")]],
    ])
    startup(Object.values(modules), registry)

    // Adjacency list with some non-class entry for starting points
    const depList = [
      ["background.ts", "BackgroundEventRouter"],
      ["compose.ts", "ComposeEventRouter"],
      ...collectDeps(registry),
    ] as [string, ...string[]][]

    await dumpTree("dependency_tree.mermaid", depList)
  })
})

/** Collect dependencies by inspecting the registry entries. */
function* collectDeps(registry: Map<string, AnyEntry>): Generator<[string, ...string[]]> {
  let knownNames = new CaseFoldingSet()
  let requiredNames = new CaseFoldingSet()
  for (let [k, v] of registry) {
    const [method, arg] = v

    knownNames.add(k)

    switch (method) {
      case "const":
        yield [k]
        break
      case "prepareOne":
        yield [k, ...arg.deps]
        for (let dep of arg.deps) {
          requiredNames.add(dep)
        }
        break
      case "resolveAll":
        yield [k, ...arg]
        for (let dep of arg) {
          requiredNames.add(dep)
        }
        break
      case "resolveOne":
        yield [k, arg]
        requiredNames.add(arg)
        break
      default:
        throw Error("unexpected command name")
    }
  }

  let missingNames = requiredNames.difference(knownNames)
  if (missingNames.size) {
    throw Error(`Missing definitions: ${Array.from(missingNames)}`)
  }
}

/**
 * Write out the dependency tree to the file in mermaid syntax.
 */
async function dumpTree(fileName: string, deps: [string, ...string[]][]): Promise<void> {
  let nodeLines = deps.map(([name, ...deps]) => `${name.toLowerCase()}["${findModule(name, deps)}<br>${name}"]`)
  let graphLines = deps.flatMap(([name, ...deps]) => (deps.length === 0 ? [] : [`${name} --> ${deps.join(" & ")}`]))
  let text = ["flowchart LR", ...nodeLines.sort(), graphLines.sort().join("\n").toLowerCase()].join("\n")

  await writeText(fileName, text)
}

function makeDummyMessenger(): Record<string, symbol> {
  const namespaces = ["runtime", "tabs", "commands", "composeAction", "scripting"] as const

  return Object.fromEntries(namespaces.map((name) => [name, Symbol(`dummy messenger.${name}`)]))
}

function findModule(name: string, deps: string[]): string {
  if (name.endsWith(".ts")) {
    return "root/"
  }
  let mod = Object.entries(modules).find(([_, v]) => name in v)?.[0]
  if (!mod) {
    if (deps.length) {
      return "(alias)"
    } else {
      return "(const)"
    }
  }
  return `${toKebabCase(mod)}/`
}
