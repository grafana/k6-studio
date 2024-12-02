import { Body, Header } from './model/types'
import { ExtractedValue } from './types'

import { fromJson } from './extraction/json'
import { fromHtml } from './extraction/html'
import { fromUrlEncoded } from './extraction/urlencoded'

import { quickHash } from './extraction/hash'
import { exhaustive } from '@/utils/typescript'

interface Payload {
  path?: string
  searchParams?: URLSearchParams
  headers?: Header[]
  body?: Body
}

export function extract(payload: Payload): ExtractedValue[] {
  return [
    ...(payload.path !== undefined ? fromPath(payload.path) : []),
    ...(payload.searchParams !== undefined
      ? fromSearchParams(payload.searchParams)
      : []),
    ...(payload.headers !== undefined ? fromHeaders(payload.headers) : []),
    ...(payload.body !== undefined ? fromBody(payload.body) : []),
  ]
}

function fromPath(path: string): ExtractedValue[] {
  return path.split('/').flatMap((value, index) => {
    if (value === '') {
      return []
    }

    return {
      name: `path[${index}]`,
      hash: quickHash(value),
      value,
      selector: {
        type: 'path',
        index,
        value,
      },
    }
  })
}

function fromSearchParams(params: URLSearchParams): ExtractedValue[] {
  return [...params.keys()].flatMap((name) => {
    return params.getAll(name).map((value, index) => {
      return {
        name: `${name}[${index}]`,
        hash: quickHash(value),
        value,
        selector: {
          type: 'search',
          index,
          name,
        },
      }
    })
  })
}

function fromHeaders(headers: Header[]): ExtractedValue[] {
  return headers.flatMap(fromHeader)
}

function fromHeader(header: Header, index: number): ExtractedValue[] {
  switch (header.type) {
    case 'authorization':
      return [
        {
          name: 'credentials',
          hash: quickHash(header.credentials),
          value: header.credentials,
          selector: {
            type: 'header',
            index,
            param: 'credentials',
          },
        },
      ]

    default:
      return []
  }
}

function fromBody(body: Body) {
  switch (body.type) {
    case 'json':
      return fromJson(body.data)

    case 'html':
      return fromHtml(body.document)

    case 'urlencoded':
      return fromUrlEncoded(body.params)

    // TODO: support extracting multipart fields.
    case 'multipart':
      return []

    case 'raw':
      return []

    default:
      return exhaustive(body)
  }
}
