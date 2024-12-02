export type JsonPrimitive = string | number | boolean | null
export type JsonObject = { [key: string]: JsonValue }
export type JsonValue = JsonPrimitive | JsonValue[] | JsonObject | null

export const tryParse = (str: JsonValue): JsonValue | undefined => {
  try {
    if (typeof str !== 'string') {
      return str
    }

    return JSON.parse(str) as JsonValue
  } catch {
    return undefined
  }
}

export const isUUID = (str: string): boolean =>
  /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i.test(str)

export const stringWeightKB = (str: string): number => {
  return new Blob([str]).size / 1024
}

export const jsonWeightKB = (value: JsonValue): number => {
  return stringWeightKB(JSON.stringify(value))
}

export const isJsonPrimitive = (value: JsonValue): value is JsonPrimitive =>
  typeof value !== 'object' || value === null
