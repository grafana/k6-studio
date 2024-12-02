import { zip, unionBy } from 'lodash-es'
import {
  parseISO,
  addMilliseconds,
  formatISO,
  differenceInMilliseconds,
} from 'date-fns'

import {
  HttpMethod,
  Exchange,
  RawBody,
  RequestBody,
  Response,
  ResponseBody,
  Header,
  Body,
  RawHeader,
} from './types'

import {
  tryParseRequestHeader,
  tryParseResponseHeader,
  toRaw,
} from '../http/headers'
import { serialize, tryDeserialize } from '../serialization'
import { Variable, JsonSelector } from '../types'

import {
  isKeyword,
  isIdentifierName,
  isStrictReservedWord,
} from '@babel/helper-validator-identifier'
import type {
  PostData,
  Response as HarResponse,
  Variable as HarVariable,
  Header as HarHeader,
  Har,
  Entry,
} from 'har-format'

declare module 'har-format' {
  export interface JSONPathVariable {
    type: 0
    name: string
    expression: string
  }

  export interface RegexVariable {
    type: 1
    name: string
    expression: string
  }

  export interface CSSSelectorVariable {
    type: 2
    name: string
    expression: string
    attribute?: string
  }

  export type Variable = JSONPathVariable | RegexVariable | CSSSelectorVariable

  export interface Entry {
    variables?: Variable[]
  }
}

function tryDeserializeRequest({
  mimeType,
  text = '',
  params,
}: PostData): RequestBody {
  if (
    mimeType === 'application/x-www-form-urlencoded' &&
    Array.isArray(params)
  ) {
    return {
      type: 'urlencoded',
      params,
    }
  }

  if (mimeType.includes('multipart/form-data') && Array.isArray(params)) {
    return {
      type: 'multipart',
      params,
    }
  }

  const raw: RawBody = { type: 'raw', mimeType, text }
  const deserialized = tryDeserialize(raw)

  if (deserialized.type === 'html') {
    return raw
  }

  return deserialized
}

function tryDeserializeResponse({
  mimeType,
  text = '',
}: HarResponse['content']): ResponseBody {
  return tryDeserialize({
    type: 'raw',
    mimeType,
    text,
  })
}

function serializeRequestBody(body: Body): PostData {
  const raw = serialize(body)

  if (body.type === 'urlencoded' || body.type === 'multipart') {
    return {
      mimeType: raw.mimeType,
      params: body.params,
    }
  }

  return {
    mimeType: raw.mimeType,
    text: raw.text,
  }
}

function isValidIdentifier(name: string) {
  return (
    !isKeyword(name) &&
    !isStrictReservedWord(name, false) &&
    isIdentifierName(name)
  )
}

function toJsonPath(selector: JsonSelector): string {
  return selector.path
    .reduce(
      (result, segment) => {
        if (typeof segment === 'number' || !isValidIdentifier(segment)) {
          result.push('[')
          result.push(segment.toString())
          result.push(']')

          return result
        }

        result.push('.')
        result.push(segment)

        return result
      },
      ['$']
    )
    .join('')
}

function toVariable(variable: Variable): HarVariable[] {
  switch (variable.selector.type) {
    case 'json':
      return [
        {
          type: 0,
          name: variable.name,
          expression: toJsonPath(variable.selector),
        },
      ]

    case 'css':
      return [
        {
          type: 2,
          name: variable.name,
          expression: variable.selector.rule,
          attribute: variable.selector.attribute,
        },
      ]

    default:
      return []
  }
}

function toHeaders(headers: Header[]): HarHeader[] {
  return headers.map(toRaw).map(({ name, value }) => ({ name, value }))
}

function fromHeaders(headers: HarHeader[]): RawHeader[] {
  return headers.map(({ name, value }) => ({ type: 'raw', name, value }))
}

function tryParseISODate(str?: string): Date {
  const date = parseISO(str ?? '')

  if (isNaN(date.getTime())) {
    return new Date(0)
  }

  return date
}

function fromResponse(response: HarResponse): Response {
  if (response) {
    return {
      headers: fromHeaders(response.headers).map(tryParseResponseHeader),
      body: response.content && tryDeserializeResponse(response.content),
    }
  }

  return { headers: [] }
}

export function fromHAR(har: Har): Exchange[] {
  return har.log.entries.map((entry) => {
    const started = tryParseISODate(entry.startedDateTime)
    const ended = addMilliseconds(started, entry.time || 0)
    const { request, response } = entry

    return {
      method: request.method as HttpMethod,
      url: new URL(request.url),
      started,
      ended,
      request: {
        headers: fromHeaders(request.headers).map(tryParseRequestHeader),
        body: request.postData && tryDeserializeRequest(request.postData),
      },
      response: fromResponse(response),
      variables: {},
    }
  })
}

export const mergeWithHAR = (har: Har, exchanges: Exchange[]): Har => ({
  log: {
    ...har.log,
    entries: zip(exchanges, har.log.entries).map(([exchange, entry]) => {
      if (exchange === undefined || entry === undefined) {
        throw new Error(
          'Cannot merge model into HAR, because they have a different number of entries.'
        )
      }

      return {
        ...entry,
        startedDateTime: formatISO(exchange.started),
        time: differenceInMilliseconds(exchange.started, exchange.ended),
        request: {
          ...entry.request,
          method: exchange.method,
          url: exchange.url.toString(),
          headers: toHeaders(exchange.request.headers),
          postData:
            exchange.request.body &&
            ({
              ...entry.request.postData,
              ...serializeRequestBody(exchange.request.body),
            } as PostData), // TODO: Use conditionals to make sure params is not undefined.
        },
        variables: unionBy(
          Object.entries(exchange.variables).flatMap(([_, variable]) =>
            toVariable(variable)
          ),
          entry.variables || [],
          (v) => v.name
        ),
      } satisfies Entry
    }),
  },
})
