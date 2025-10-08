import { toCamelCase, toKebabCase } from "@std/text"
import * as appBackground from "src/app-background"
import * as appCompose from "src/app-compose"
import * as appOptions from "src/app-options"
import * as ghosttextAdaptor from "src/ghosttext-adaptor"
import * as ghosttextRunner from "src/ghosttext-runner"
import * as ghosttextSession from "src/ghosttext-session"
import type { ResolveQuery } from "src/root"
import { wireless } from "src/root/util"
import * as thunderbird from "src/thunderbird"
import * as util from "src/util"
import { CaseFoldingSet } from "src/util"
import { describe, expect, test } from "vitest"
import { caseInsensitiveToposort } from "./util/case_insensitive_toposort"
import { writeText } from "./util/io"

type AnyEntry = ResolveQuery<Record<string, unknown>>

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

describe("startup", () => {
  const constants: [string, AnyEntry][] = [
    ["messenger", ["const", makeDummyMessenger()]],
    ["body", ["const", Symbol("body")]],
    ["domParser", ["const", Symbol("domParser")]],
    ["selection", ["const", Symbol("selection")]],
    ["heart", ["const", Symbol("heart")]],
    ["optionsSyncCtor", ["const", Symbol("optionsSyncCtor")]],
  ]

  test("All collected classes should be resolvable", () => {
    const registry = new TestRegistry(constants)
    const wire = wireless(Object.values(modules), registry)

    // TODO test handling of name clash across modules
    let all = wire(Array, registry.keys()) as unknown[]

    expect(all).has.length(registry.size)
    expect(all.every((x) => x)).toBeTruthy()
  })

  test("All collected classes won't use given dependency in constructor immediately, but refers to it later", async () => {
    const registry = new Map(constants)
    wireless(Object.values(modules), registry)

    checkDependencyUsage(registry)

    // Adjacency list
    let deps = [...collectDeps(registry)].sort()

    // Add some non-class entry for starting points
    const depList = [
      ["background.ts", ["BackgroundEventRouter"]],
      ["compose.ts", ["ComposeEventRouter"]],
      ["options.ts", ["OptionsEventRouter"]],
      ...deps,
    ] as [string, string[]][]

    let mermaid = makeMermaid(depList)
    let startupCode = dumpStartupCode(deps, registry)

    await dumpTree("dependency_tree.md", mermaid, startupCode)
  })
})

/** Collect dependencies by inspecting the registry entries. */
function* collectDeps(registry: Map<string, AnyEntry>): Generator<[string, string[]]> {
  let knownNames = new CaseFoldingSet()
  let requiredNames = new CaseFoldingSet()
  for (let [k, v] of registry) {
    const [method, arg] = v

    knownNames.add(k)

    switch (method) {
      case "const":
        yield [k, []]
        break
      case "prepareOne":
        yield [k, arg.deps]
        for (let dep of arg.deps) {
          requiredNames.add(dep)
        }
        break
      case "resolveAll":
        yield [k, [...arg]]
        for (let dep of arg) {
          requiredNames.add(dep)
        }
        break
      case "resolveOne":
        yield [k, [arg]]
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
async function dumpTree(fileName: string, mermaid: Iterable<string>, startupCode: Iterable<string>): Promise<void> {
  await writeText(
    fileName,
    [
      "## Dependency Graph",
      "",
      "```mermaid",
      ...mermaid,
      "```",
      "",
      "## Startup Example",
      "",
      "```typescript",
      ...startupCode,
      "```",
    ].join("\n"),
  )
}

/**
 * Write out the dependency tree to the file in mermaid syntax.
 */
function* makeMermaid(deps: [string, string[]][]): Generator<string> {
  yield "flowchart LR"
  yield* deps.map(([name, deps]) => `${name.toLowerCase()}["${findModule(name, deps)}<br>${name}"]`)
  yield* deps.flatMap(([name, deps]) => (deps.length === 0 ? [] : [`${name} --> ${deps.join(" & ")}`.toLowerCase()]))
}

function makeDummyMessenger(): Record<string, symbol> {
  const namespaces = ["runtime", "tabs", "commands", "composeAction", "scripting"] as const

  return Object.fromEntries(namespaces.map((name) => [name, Symbol(`dummy messenger.${name}`)]))
}

/** Determine which module a name belongs to. */
function findModule(name: string, deps: string[] | undefined): string {
  if (name.endsWith(".ts")) {
    return "root/"
  }
  let mod = Object.entries(modules).find(([_, v]) => name in v)?.[0]
  if (!mod) {
    const hasDependency = deps?.length
    if (hasDependency) {
      return "(alias)"
    } else {
      return "(const)"
    }
  }
  return `${toKebabCase(mod)}/`
}

/** Parse the class source and return the part after the constructor */
function sliceSourceAfterCtor(ctor: new () => unknown): string {
  let source = `${ctor}`
  let m = /\bconstructor\s*[(]\s*[{]?\s*[^{]+[{][^}]+[}]/d.exec(source)

  return m?.[0] ? source.slice(m.index + m[0].length) : ""
}

/** Checks if all dependencies are used in class */
function checkDependencyUsage(registry: Map<string, AnyEntry>): void {
  for (const [name, [method, arg]] of registry) {
    if (method !== "prepareOne" || arg.deps.length === 0) {
      continue
    }
    let { ctor, deps } = arg
    let body = sliceSourceAfterCtor(ctor)
    if (!body) {
      throw Error(`Failed to parse the entry. Is it a ES class? [${name}]`)
    }
    for (let dep of deps) {
      expect.soft(body).includes(`this.${dep}`, `class ${name} should use this.${dep}`)
    }
  }
}

/** Generates an example TypeScript code for startup */
function* dumpStartupCode(depList: [string, string[]][], registry: Map<string, AnyEntry>): Generator<string> {
  const catalog: [string, string][] = depList.flatMap(([name]) =>
    registry.get(name)?.[0] === "prepareOne" ? [[toCamelCase(name), name]] : [],
  )
  const moduleNames = Object.groupBy(catalog, ([, depName]) => findModule(depName, undefined))

  for (const [mod, subcatalog] of Object.entries(moduleNames)) {
    yield `import { ${subcatalog?.map(([, t]) => t).join(", ")} } from "src/${mod}"`
  }

  yield ""
  yield "export type Catalog = {"
  yield* catalog.map(([name, t]) => `  ${name}: ${t}`)
  yield "}"
  yield ""
  yield "export function startup(consts: BackgroundConstants & ComposeConstants & OptionsConstants): Catalog {"
  yield* dumpStartupBody(depList, registry)
  yield ""
  yield `  return {${catalog.map(([name]) => name).join(", ")}}`
  yield "}"
}

/** Generates TypeScript body for startup */
function* dumpStartupBody(depList: [string, string[]][], registry: Map<string, AnyEntry>): Generator<string> {
  let depMap = new Map(depList)
  for (const name of caseInsensitiveToposort(depList).reverse()) {
    let [method] = registry.get(name) ?? []
    let required = depMap.get(name) ?? []
    let camel = toCamelCase(name)

    switch (method) {
      case "const":
        yield `  const ${camel} = consts.${camel}`
        break
      case "prepareOne":
        yield `  const ${camel} = new ${name}(${required.join(", ")})`
        break
      case "resolveAll":
        yield `  const ${camel} = [${required.map(toCamelCase).join(", ")}]`
        break
      case "resolveOne":
        yield `  const ${camel} = ${toCamelCase(required[0] ?? "")}`
        break
      default:
        throw Error("unexpected command name")
    }
  }
}
