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
