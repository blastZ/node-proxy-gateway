import { AuthInfo } from "../interfaces/auth-info.interface";

export function parseHeaders(headers: [string, string][], authInfo?: AuthInfo) {
  const result: Record<string, string> = {};

  headers.map(([headerKey, valueOrKey]) => {
    if (valueOrKey.startsWith("$")) {
      const [pre, key] = valueOrKey.split("$");
      if (key.includes(".")) {
        const keys = key.split(".");

        let value: unknown = authInfo || {};
        let vTag = false;

        for (let k of keys) {
          const v = (value as Record<string, unknown>)?.[k];
          if (typeof v !== "undefined" && v !== null) {
            value = v;
            vTag = true;
          } else {
            value = undefined;
            vTag = false;
            break;
          }
        }

        if (vTag && typeof value !== "undefined" && value !== null) {
          result[headerKey] = encodeURI(String(value));
        }
      } else {
        const value = ((authInfo || {}) as Record<string, unknown>)?.[key];
        if (typeof value !== "undefined" && value !== null) {
          result[headerKey] = encodeURI(String(value));
        }
      }
    } else {
      result[headerKey] = encodeURI(valueOrKey);
    }
  });

  return result;
}
