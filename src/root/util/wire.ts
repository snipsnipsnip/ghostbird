/** @file A part of startup.ts that is less opinionated than the other half */

// Requirements:
// * Cache instances when they are requested ("singleton")
// * Collect duplicated aliases and populate them into arrays
// * Read-only after construction
// * Alias handling
// Non-goals:
// * async support
// * Injection methods other than constructor injection
// * Injection targets other than ES classes
// * Decorators (may be added if a suitable example appears)
// * Comprehensive validations and diagnostics for configuration errors (e.g., loops or name clashes). We assume users have unit tests in place; additional checks might be added if a bug slips through to production

/**
 * A class constructor with some metadata to be registered to the container.
 */
export interface IClassInfo<TCatalog, T = unknown, TArgs extends unknown[] = unknown[]> {
  /**
   * Specifies the lifetime of the class.
   * If `true`, only one instance is created and shared.
   * If `false`, a new instance is created each time it is needed.
   */
  isSingleton: boolean
  /**
   * Specifies whether this class requires dependencies as arrays. Useful for composites or aggregates.
   * If `true`, each argument to the constructor will be an array of instances.
   * If `false`, each argument to the constructor will be an instance.
   */
  wantArray: boolean
  /**
   * The name of the class as a dependency.
   */
  name: keyof TCatalog & string
  /**
   * The constructor of the class.
   */
  ctor: new (
    ...args: TArgs
  ) => T
  /**
   * Names of dependencies that the constructor requires.
   */
  deps: (string & keyof TCatalog)[]
  /**
   * Optional alternative names to register the class as.
   */
  aliases?: (keyof TCatalog & string) | (keyof TCatalog & string)[] | undefined
}

/**
 * A DI container that appears to be type-safe after construction
 */
export interface IWire<TCatalog> {
  /**
   * Instantiate the given constructor with the dependencies that this container has
   */
  wire<TCtor>(ctor: TCtor, deps: Iterable<string & keyof TCatalog>): Resolved<TCatalog, TCtor>
}

// We could check more strictly like:
//
// * Verify that each name listed in `deps` corresponds to the respective parameter type
// * Verify that the property name really corresponds to the type in the catalog
// * Check each dependency's constructor recursively to ensure that all of them are in the catalog
//
// But that's covered by the unit tests, so I'll stop playing with metaprogramming and focus on the the add-on for now.

/**
 * Resolves to the instance type of `TCtor` after some checks.
 */
export type Resolved<TCatalog, TCtor> = TCtor extends new (
  ...args: infer TArgs
) => infer T
  ? ResolvableArgs<TCatalog, T, TArgs>
  : ["Failed to unpack arguments. Is it a constructor?", never, TCtor]

/**
 * Resolves to `T` if all of the `TArgs` are listed in `TCatalog`. Resolves to an error otherwise.
 */
export type ResolvableArgs<TCatalog, T, TArgs> = TArgs extends [infer TArg, ...infer TRest]
  ? TArg extends TCatalog[keyof TCatalog]
    ? ResolvableArgs<TCatalog, T, TRest>
    : ["An argument is not listed in TCatalog", never, TArg]
  : TArgs extends []
    ? T
    : ["Failed to unpack arguments. Is it a constructor?", never, TArgs]

export interface IResolver<TCatalog> {
  /**
   * Creates or retrieves an instance of the named class.
   */
  resolveOne<Name extends keyof TCatalog & string>(name: Name): TCatalog[Name]
  /**
   * Instantiate the class, or get the cached instance if one is available.
   */
  createOne<T>(info: Readonly<IClassInfo<TCatalog, T>>): T
  /**
   * Prepare instances of registered classes.
   */
  resolveAll<Name extends keyof TCatalog & string>(v: Iterable<Name>): TCatalog[Name][]
}

/**
 * Stores registered classes for lookup.
 */
export type IRegistry<TCatalog> = Pick<Map<string, ResolveQuery<TCatalog, unknown>>, "get" | "set">

/**
 * An entry in the registry. It contains a query to the `IResolver` paired with a key.
 */
export type ResolveQuery<TCatalog, T> =
  | ["createOne", Readonly<IClassInfo<TCatalog, T>>]
  | ["resolveOne", keyof TCatalog & string]
  | ["resolveAll", Iterable<keyof TCatalog & string>]
  | ["const", T]

/**
 * Collects and handles duplicate aliases
 */
export class AliasMap<TCatalog> {
  constructor(
    private readonly map: Map<keyof TCatalog & string, Set<keyof TCatalog & string>>,
    private readonly duplicateWanted: Set<keyof TCatalog & string>,
    private readonly nameForDuplicatesOf: (alias: string) => string,
  ) {}

  /**
   * Classes may have duplicate aliases, so we collect them first to register later
   */
  collectAliases({ aliases, name, wantArray, deps }: IClassInfo<TCatalog>): void {
    if (wantArray) {
      for (let dep of deps) {
        this.duplicateWanted.add(dep)
      }
    }

    if (!aliases) {
      return
    }
    let keys = typeof aliases === "string" ? [aliases] : aliases
    for (const key of keys) {
      let names = this.map.get(key) ?? new Set()
      this.map.set(key, names.add(name))
    }
  }

  /**
   * Builds entries to add to the IRegistry from collected aliases
   */
  *makeAliasEntries(): Generator<[string, ResolveQuery<TCatalog, unknown>]> {
    for (const [k, v] of this.map) {
      const [one] = v
      if (one) {
        yield [k, ["resolveOne", one]]
      }

      if (this.duplicateWanted.has(k)) {
        // provide duplicates as an array if needed
        yield [this.nameForDuplicatesOf(k), ["resolveAll", v]]
      } else if (1 < v.size) {
        // Duplicates are not allowed otherwise
        throw Error(`Duplicate registrations found for [${k}]: ${v}`)
      }
    }
  }
}

/**
 * A factory to create instances of registered classes.
 */
export class Wire<TCatalog> implements IWire<TCatalog>, IResolver<TCatalog> {
  readonly cache = new Map<keyof TCatalog & string, unknown>()

  constructor(
    private readonly registry: Pick<IRegistry<TCatalog>, "get">,
    private readonly nameForDuplicatesOf: (alias: string) => string,
  ) {}

  wire<TCtor>(ctor: TCtor, deps: Iterable<string & keyof TCatalog>): Resolved<TCatalog, TCtor> {
    const resolved = this.resolveAll(deps)
    return Reflect.construct(ctor as new () => Resolved<TCatalog, TCtor>, resolved)
  }

  resolveAll<Name extends keyof TCatalog & string>(deps: Iterable<Name>): TCatalog[Name][] {
    return Array.from(deps, (name) => this.resolveOne(name))
  }

  resolveOne<Name extends keyof TCatalog & string>(name: Name): TCatalog[Name] {
    const entry = this.registry.get(name) as ResolveQuery<TCatalog, TCatalog[Name]> | undefined
    if (!entry) {
      throw Error(`No registration for [${name}]`)
    }

    if (entry[0] === "const") {
      return entry[1]
    }

    let method = this[entry[0]] as (this: this, arg: NonNullable<typeof entry>[1]) => TCatalog[Name] | undefined
    let instance = method?.call(this, entry[1])

    if (!instance) {
      throw Error(`Failed to resolve [${name}] via ${entry}`)
    }
    return instance
  }

  createOne<T>(info: Readonly<IClassInfo<TCatalog, T>>): T {
    return info.isSingleton ? this.createCached(info) : this.create(info)
  }

  private createCached<T>(info: Readonly<IClassInfo<TCatalog, T>>): T {
    let instance = this.cache.get(info.name) as T | undefined
    if (!instance) {
      instance = this.create(info)
      this.cache.set(info.name, instance)
    }
    return instance
  }

  private create<T>({ ctor, deps, wantArray }: Readonly<IClassInfo<TCatalog, T>>): T {
    // Pass arrays for classes that want all duplicates
    let depNames = wantArray ? deps.map(this.nameForDuplicatesOf) : deps

    // Assumes there is no dependency loop; we test elsewhere to verify this
    return this.wire(ctor, depNames as (keyof TCatalog & string)[]) as T
  }
}

/**
 * Generates the name to which duplicate registrations are collected as an array
 */
const nameForDuplicatesOf = (alias: string): string => `${alias}[]`

/**
 * Creates a factory from the collected class constructors and their parameters
 * @param classes Class constructors with some metadata to instruct its construction
 * @param registry A map used for caching registrations
 * @returns A wrapped registry that does dependency injection
 */
export function wire<TCatalog>(
  classes: Iterable<Readonly<IClassInfo<TCatalog>>>,
  registry: IRegistry<TCatalog>,
): IWire<TCatalog> {
  let aliasCollector = new AliasMap<TCatalog>(new Map(), new Set(), nameForDuplicatesOf)
  for (let info of classes) {
    registry.set(info.name, ["createOne", info])
    aliasCollector.collectAliases(info)
  }
  for (let entry of aliasCollector.makeAliasEntries()) {
    registry.set(...entry)
  }
  return new Wire(registry, nameForDuplicatesOf)
}
