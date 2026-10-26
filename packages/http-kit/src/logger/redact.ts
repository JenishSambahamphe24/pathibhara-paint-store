const SENSITIVE_KEYS = new Set([
  "password",
  "passwd",
  "secret",
  "token",
  "apikey",
  "api_key",
  "authorization",
  "cookie",
  "accesstoken",
  "access_token",
  "refreshtoken",
  "refresh_token",
  "creditcard",
  "credit_card",
  "ssn",
  "cvv",
]);

export class Redact {
  static value(obj: unknown): unknown {
    if (typeof obj !== "object" || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map((item) => Redact.value(item));

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        result[key] = "[REDACTED]";
      } else if (typeof value === "object" && value !== null) {
        result[key] = Redact.value(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }
}
