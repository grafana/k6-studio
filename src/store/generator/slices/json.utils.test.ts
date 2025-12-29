import { describe, expect, it } from 'vitest'

import { ProxyData } from '@/types'
import { HarHeader } from '@/types/recording'

import {
  extractUniqueJsonPaths,
  generateJsonPaths,
  isJsonContentType,
  queryStaticJsonPaths,
} from './json.utils'

describe('generateJsonPaths', () => {
  it('returns [] for empty input', () => {
    expect(generateJsonPaths('')).toEqual([])
    expect(generateJsonPaths(undefined)).toEqual([])
  })

  it('returns [] for invalid JSON', () => {
    expect(generateJsonPaths('{not json')).toEqual([])
  })

  it('generates paths for nested objects', () => {
    const input = JSON.stringify({ pizza: { user: { name: 'test' } } })
    const paths = generateJsonPaths(input)

    expect(paths).toEqual(
      expect.arrayContaining(['pizza', 'pizza.user', 'pizza.user.name'])
    )
  })

  it('generates paths for arrays with indexes', () => {
    const input = JSON.stringify({ items: [{ id: 1 }, { id: 2 }] })
    const paths = generateJsonPaths(input)

    expect(paths).toEqual(
      expect.arrayContaining([
        'items',
        'items[0]',
        'items[0].id',
        'items[1]',
        'items[1].id',
      ])
    )
  })

  it('dedupes paths', () => {
    const input = JSON.stringify({ a: { b: 1 }, a2: { b: 2 } })
    const paths = generateJsonPaths(input)

    expect(new Set(paths).size).toBe(paths.length)
  })
})

describe('isJsonContentType', () => {
  it('returns false for empty headers', () => {
    expect(isJsonContentType([] as HarHeader[])).toBe(false)
  })

  it('returns true for application/json (case-insensitive)', () => {
    expect(
      isJsonContentType([
        { name: 'Content-Type', value: 'Application/JSON; charset=utf-8' },
      ] as HarHeader[])
    ).toBe(true)
  })

  it('returns false when name/value missing', () => {
    expect(
      isJsonContentType([
        { name: '', value: 'application/json' },
      ] as HarHeader[])
    ).toBe(false)
    expect(
      isJsonContentType([{ name: 'content-type', value: '' }] as HarHeader[])
    ).toBe(false)
  })

  it('returns false for non-json content types', () => {
    expect(
      isJsonContentType([
        { name: 'content-type', value: 'text/plain' },
      ] as HarHeader[])
    ).toBe(false)
  })
})

describe('extractUniqueJsonPaths', () => {
  it('dedupes request and response paths across proxies', () => {
    const proxies = [
      {
        request: { jsonPaths: ['a', 'b'] },
        response: { jsonPaths: ['x'] },
      },
      {
        request: { jsonPaths: ['b', 'c'] },
        response: { jsonPaths: ['x', 'y'] },
      },
      { request: undefined, response: undefined },
    ] as ProxyData[]

    const res = extractUniqueJsonPaths(proxies)

    expect(res.requestJsonPaths).toEqual(
      expect.arrayContaining(['a', 'b', 'c'])
    )
    expect(res.responseJsonPaths).toEqual(expect.arrayContaining(['x', 'y']))

    expect(new Set(res.requestJsonPaths).size).toBe(res.requestJsonPaths.length)
    expect(new Set(res.responseJsonPaths).size).toBe(
      res.responseJsonPaths.length
    )
  })
})

describe('queryStaticJsonPaths', () => {
  const options = [
    'pizza',
    'pizza.user',
    'pizza.user.name',
    'pizza.user.email',
    'orders[0].id',
  ] as const

  it('mode=onDot filters by base prefix + current token (case-insensitive)', async () => {
    const res = await queryStaticJsonPaths(
      'recordingId1',
      'pizza.user.N',
      'onDot',
      [...options]
    )
    expect(res).toEqual(['pizza.user.name'])
  })

  it('mode=onDot with no prefix uses the first segment', async () => {
    const res = await queryStaticJsonPaths('recordingId1', 'p', 'onDot', [
      ...options,
    ])
    expect(res).toEqual(
      expect.arrayContaining([
        'pizza',
        'pizza.user',
        'pizza.user.name',
        'pizza.user.email',
      ])
    )
  })

  it('mode=onFirstKey behaves like contains-mode (current implementation)', async () => {
    const res = await queryStaticJsonPaths(
      'recordingId1',
      'USER',
      'onFirstKey',
      [...options]
    )
    expect(res).toEqual(
      expect.arrayContaining([
        'pizza.user',
        'pizza.user.name',
        'pizza.user.email',
      ])
    )
  })

  it('mode=onThirdKey behaves like contains-mode (current implementation)', async () => {
    const res = await queryStaticJsonPaths(
      'recordingId1',
      'orders',
      'onThirdKey',
      [...options]
    )
    expect(res).toEqual(['orders[0].id'])
  })
})
