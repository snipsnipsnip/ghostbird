export class CaseFoldingMap<T> extends Map<string, T> {
  override get(key: string): T | undefined {
    return super.get(key.toLowerCase())
  }

  override set(key: string, value: T): this {
    return super.set(key.toLowerCase(), value)
  }

  override has(key: string): boolean {
    return super.has(key.toLowerCase())
  }

  override delete(key: string): boolean {
    return super.delete(key.toLowerCase())
  }
}
export class CaseFoldingSet extends Set<string> {
  override add(value: string): this {
    return super.add(value.toLowerCase())
  }
  override delete(value: string): boolean {
    return super.delete(value.toLowerCase())
  }
  override has(value: string): boolean {
    return super.has(value.toLowerCase())
  }
}
