import { get } from 'lodash-es'
import { safeJsonParse } from '@/utils/json'

export const matchBeginEnd = (value: string, begin: string, end: string) => {
  // matches only the first occurrence
  const regex = new RegExp(`${begin}(.*?)${end}`)
  const match = value.match(regex)
  if (match) {
    return match[1]
  }
}

export const matchRegex = (value: string, regexString: string) => {
  // matches only the first occurrence
  const regex = new RegExp(regexString)
  const match = value.match(regex)
  if (match) {
    return match[1]
  }
}

export const getJsonObjectFromPath = (value: string, path: string) => {
  return get(safeJsonParse(value), path)
}

// @ts-expect-error we have commonjs set as module option
if (import.meta.vitest) {
  // @ts-expect-error we have commonjs set as module option
  const { it, expect } = import.meta.vitest

  it('match begin end', () => {
    expect(matchBeginEnd('<div>cat</div>', '<div>', '</div>')).toBe('cat')
    expect(matchBeginEnd('jumpinginthelake', 'ing', 'the')).toBe('in')
    expect(matchBeginEnd('hello', '<a>', '</a>')).toBeUndefined()
  })

  it('match regex', () => {
    expect(matchRegex('<div>cat</div>', '<div>(.*?)</div>')).toBe('cat')
    expect(matchRegex('jumpinginthelake', 'ing(.*?)the')).toBe('in')
    expect(matchRegex('hello', '<a>(.*?)</a>')).toBeUndefined()
  })

  it('get json object', () => {
    expect(getJsonObjectFromPath('{"hello":"world"}', 'hello')).toBe('world')
    expect(getJsonObjectFromPath('{"hello":"world"}', 'world')).toBeUndefined()
    expect(getJsonObjectFromPath('[{"hello":"world"}]', '[0].hello')).toBe(
      'world'
    )
    expect(getJsonObjectFromPath('hello', '[0]')).toBeUndefined()
  })
}
