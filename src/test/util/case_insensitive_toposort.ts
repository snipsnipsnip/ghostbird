//@ts-expect-error
import Toposort from "toposort-class"

/**
 * Sorts the adjacency list of strings. Comparison is case insensitive.
 * @param deps adjacency list of strings
 * @param casefold callback used to normalize strings to compare them
 * @returns topologically sorted list of strings (ordered from dependencies to dependents, so you probably want to reverse the result)
 */
export function caseInsensitiveToposort(
  deps: Iterable<[string, string[]]>,
  casefold: (node: string) => string = (name: string) => name.toLowerCase(),
): string[] {
  let t = new Toposort()
  let m = new Map<string, string>()
  for (const [name, names] of deps) {
    const folded = casefold(name)
    m.set(folded, name)
    t.add(folded, names.map(casefold))
  }
  let sorted = t.sort() as string[]

  // Restore case of the strings
  return sorted.map((n) => m.get(n) ?? n)
}
