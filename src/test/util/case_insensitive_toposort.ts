//@ts-expect-error
import Toposort from "toposort-class"

export function caseInsensitiveToposort(deps: Iterable<[string, string[]]>): string[] {
  let t = new Toposort()
  let m = new Map<string, string>()
  for (const [name, names] of deps) {
    m.set(name.toLowerCase(), name)
    t.add(
      name.toLowerCase(),
      names.map((n) => n.toLowerCase()),
    )
  }
  let sorted = t.sort() as string[]

  return sorted.map((n) => m.get(n) ?? n)
}
