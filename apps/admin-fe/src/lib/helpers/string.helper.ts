export class StringHelper {
  static titleCase(value: string): string {
    return value
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .split(/[_\s-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  }
}
