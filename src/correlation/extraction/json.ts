import { Path, ExtractedValue } from '../types'
import { JsonValue, jsonWeightKB, isJsonPrimitive } from '../utils'
import { quickHash } from './hash'

// TODO: This should generate some nice camel-cased JS-names
const toName = (path: Path) => {
  const [part] = path.slice(-1)
  if (part === undefined) {
    return 'root'
  }

  return typeof part === 'number' ? `index${part}` : part
}

// Imposing a limit of size is not ideal because size does not necessarily mean
// deep or many properties but this seems like an easy guesstimation.
// The 780kB limit was found by a blob of 960kB something persistently leading to
// Max callstack exceeded, so I dialed it down a notch for safety measures.
const JSON_SIZE_LIMIT_KB = 780

export const fromJson = (value: JsonValue): ExtractedValue[] => {
  // Skip extraction if blob is too big.
  if (jsonWeightKB(value) > JSON_SIZE_LIMIT_KB) {
    return []
  }

  const item = (
    hash: string,
    value: JsonValue,
    path: Path
  ): ExtractedValue => ({
    name: toName(path),
    hash,
    value,
    selector: {
      type: 'json',
      path,
    },
  })

  const result: ExtractedValue[] = []

  const build = (path: Path, value: JsonValue): ExtractedValue => {
    if (isJsonPrimitive(value)) {
      const primitive = item(quickHash(value), value, path)

      result.push(primitive)

      return primitive
    }

    if (Array.isArray(value)) {
      const hash = ['array']
      let index = 0

      for (const content of value) {
        const childValue = build([...path, index], content)

        hash.push(String(index))
        hash.push(childValue.hash)

        index += 1
      }

      const array = item(hash.join(''), value, path)

      result.push(array)

      return array
    }

    const keys = Object.keys(value).sort()
    const hash = ['object']

    for (const name of keys) {
      const content = name in value ? value[name] : undefined

      if (content === undefined) {
        continue
      }

      const childValue = build([...path, name], content)

      hash.push(name)
      hash.push(childValue.hash)
    }

    const object = item(hash.join(''), value, path)

    result.push(object)

    return object
  }

  build([], value)

  return result
}
