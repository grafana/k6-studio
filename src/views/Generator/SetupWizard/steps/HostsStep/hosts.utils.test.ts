import { describe, expect, it } from 'vitest'

import {
  createProxyData,
  createRequest,
  createResponse,
} from '@/test/factories/proxyData'

import { buildHostInventory, mergeHostSuggestions } from './hosts.utils'

function requestsFor(
  hosts: Array<{ host: string; path?: string; contentType?: string }>
) {
  return hosts.map(({ host, path, contentType }, index) =>
    createProxyData({
      id: `req-${index}`,
      request: createRequest({ host, path: path ?? '/' }),
      response: createResponse({
        headers: [['content-type', contentType ?? 'application/json']],
      }),
    })
  )
}

describe('buildHostInventory', () => {
  it('groups requests by host with counts, content types and sample paths', () => {
    const requests = requestsFor([
      { host: 'api.example.com', path: '/v1/users' },
      { host: 'api.example.com', path: '/v1/orders' },
      {
        host: 'cdn.example.com',
        path: '/app.js',
        contentType: 'text/javascript; charset=utf-8',
      },
    ])

    expect(buildHostInventory(requests)).toEqual([
      {
        host: 'api.example.com',
        requestCount: 2,
        staticAssetCount: 0,
        contentTypes: ['application/json'],
        samplePaths: ['/v1/users', '/v1/orders'],
      },
      {
        host: 'cdn.example.com',
        requestCount: 1,
        staticAssetCount: 1,
        contentTypes: ['text/javascript'],
        samplePaths: ['/app.js'],
      },
    ])
  })

  it('deduplicates sample paths and caps them at five', () => {
    const requests = requestsFor(
      Array.from({ length: 8 }, (_, index) => ({
        host: 'api.example.com',
        path: index < 2 ? '/same' : `/path-${index}`,
      }))
    )

    const inventory = buildHostInventory(requests)

    expect(inventory[0]?.requestCount).toBe(8)
    expect(inventory[0]?.samplePaths).toHaveLength(5)
    expect(inventory[0]?.samplePaths[0]).toBe('/same')
  })

  it('skips requests without a host', () => {
    const requests = requestsFor([{ host: '' }, { host: 'api.example.com' }])

    expect(buildHostInventory(requests)).toHaveLength(1)
  })
})

describe('mergeHostSuggestions', () => {
  const inventory = [
    {
      host: 'api.example.com',
      requestCount: 2,
      staticAssetCount: 0,
      contentTypes: ['application/json'],
      samplePaths: ['/v1/users'],
    },
    {
      host: 'cdn.example.com',
      requestCount: 1,
      staticAssetCount: 1,
      contentTypes: ['text/javascript'],
      samplePaths: ['/app.js'],
    },
    {
      host: 'fonts.gstatic.com',
      requestCount: 1,
      staticAssetCount: 1,
      contentTypes: ['font/woff2'],
      samplePaths: ['/font.woff2'],
    },
  ]

  it('joins suggestions with request counts and sorts suggested hosts first', () => {
    const merged = mergeHostSuggestions(inventory, [
      {
        host: 'api.example.com',
        category: 'api',
        include: false,
        reason: 'Not under test.',
      },
      {
        host: 'cdn.example.com',
        category: 'cdn',
        include: false,
        reason: 'Static assets.',
      },
      {
        host: 'fonts.gstatic.com',
        category: 'other',
        include: true,
        reason: 'Primary backend.',
      },
    ])

    expect(merged.map((entry) => entry.host)).toEqual([
      'fonts.gstatic.com',
      'api.example.com',
      'cdn.example.com',
    ])
    expect(merged[0]).toMatchObject({ suggested: true, requestCount: 1 })
    expect(merged[1]).toMatchObject({ suggested: false, requestCount: 2 })
  })

  it('backfills hosts the agent omitted as not suggested', () => {
    const merged = mergeHostSuggestions(inventory, [
      {
        host: 'api.example.com',
        category: 'api',
        include: true,
        reason: 'Primary backend.',
      },
    ])

    expect(merged.map((entry) => entry.host)).toEqual([
      'api.example.com',
      'cdn.example.com',
      'fonts.gstatic.com',
    ])
    expect(merged[1]).toMatchObject({
      suggested: false,
      category: 'other',
      reason: 'Not classified by the Assistant.',
    })
  })

  it('ignores suggestions for hosts that are not in the recording', () => {
    const merged = mergeHostSuggestions(inventory, [
      {
        host: 'invented.example.com',
        category: 'api',
        include: true,
        reason: 'Hallucinated.',
      },
    ])

    expect(
      merged.find((entry) => entry.host === 'invented.example.com')
    ).toBeUndefined()
  })
})
