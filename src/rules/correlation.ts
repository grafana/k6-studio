import { ProxyData, RequestSnippetSchema, Response, Request } from '@/types'
import { CorrelationRule, CorrelationStateMap } from '@/types/rules'
import { cloneDeep, get } from 'lodash-es'
import { canonicalHeaderKey } from './utils'
import { getHeaderValues } from '@/utils/headers'
import { exhaustive } from '@/utils/typescript'

export function applyCorrelationRule(
  requestSnippetSchema: RequestSnippetSchema,
  rule: CorrelationRule,
  correlationStateMap: CorrelationStateMap,
  sequentialIdGenerator: Generator<number>
): RequestSnippetSchema {
  // this is the modified schema that we return to the accumulator
  const snippetSchemaReturnValue = cloneDeep(requestSnippetSchema)

  // if we have an extracted value we try to apply it to the request
  // note: this comes before the extractor to avoid applying an extracted value on the same request/response pair
  const correlationState = correlationStateMap[rule.id]
  let uniqueId: number | undefined
  if (correlationState?.extractedValue) {
    const extractedValue = correlationState.extractedValue
    // we populate uniqueId since it doesn't have to be regenerated
    // this will be passed to the tryCorrelationExtraction function
    uniqueId = correlationState.generatedUniqueId

    // TODO: this is the global replacer when the replacer object is not configured, the replacer functioncality has to be implemented
    if (requestSnippetSchema.data.request.content.includes(extractedValue)) {
      // default behaviour replaces all occurences of the string
      // content
      const replacedRequestContent =
        requestSnippetSchema.data.request.content.replaceAll(
          correlationState.extractedValue,
          `\${correl_${correlationState.generatedUniqueId}}`
        )
      // url
      const replacedRequestUrl =
        requestSnippetSchema.data.request.url.replaceAll(
          extractedValue,
          `\${correl_${correlationState.generatedUniqueId}}`
        )
      // headers
      const replacedRequestHeaders =
        requestSnippetSchema.data.request.headers.map(([key, value]) => {
          const replacedValue = value.replaceAll(
            extractedValue,
            `\${correl_${correlationState.generatedUniqueId}}`
          )
          return [key, replacedValue] as [string, string]
        })

      snippetSchemaReturnValue.data.request.content = replacedRequestContent
      snippetSchemaReturnValue.data.request.url = replacedRequestUrl
      snippetSchemaReturnValue.data.request.headers = replacedRequestHeaders

      // we clone to keep a reference even if the objects gets mutated further
      const originalRequest = cloneDeep(requestSnippetSchema.data.request)
      const modifiedRequest = cloneDeep(snippetSchemaReturnValue.data.request)
      correlationState.requestsReplaced.push([originalRequest, modifiedRequest])
    }
  }

  // try to extract the value
  const { extractedValue, correlationExtractionSnippet, generatedUniqueId } =
    tryCorrelationExtraction(
      rule,
      requestSnippetSchema.data,
      uniqueId,
      sequentialIdGenerator
    )

  if (extractedValue && correlationExtractionSnippet) {
    if (correlationState) {
      // we only increment the count and we keep the first extracted value
      correlationState.count += 1
      // note: if the correlation extracts from URL we will need to showcase the request
      correlationState.responsesExtracted.push(requestSnippetSchema.data)
    } else {
      correlationStateMap[rule.id] = {
        extractedValue,
        count: 1,
        responsesExtracted: [requestSnippetSchema.data],
        requestsReplaced: [],
        generatedUniqueId,
      }

      return {
        ...requestSnippetSchema,
        after: [...requestSnippetSchema['after'], correlationExtractionSnippet], // ! we know that we have the values because we are in the if condition but might need better types
      }
    }
  }

  // return requestSnippetSchema
  return snippetSchemaReturnValue
}

const tryCorrelationExtraction = (
  rule: CorrelationRule,
  proxyData: ProxyData,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  // correlation works on responses so if we have no response we should return early except in case the selector is checking
  // the url, in that case the value is extracted from a request so it's fine to not have a response
  if (
    !proxyData.response &&
    (!('from' in rule.extractor.selector) ||
      rule.extractor.selector.from !== 'url')
  ) {
    return {
      extractedValue: undefined,
      correlationExtractionSnippet: undefined,
      generatedUniqueId: undefined,
    }
  }

  switch (rule.extractor.selector.type) {
    case 'begin-end':
      switch (rule.extractor.selector.from) {
        case 'body':
          return extractCorrelationBeginEndBody(
            rule,
            proxyData.response,
            uniqueId,
            sequentialIdGenerator
          )
        case 'headers':
          return extractCorrelationBeginEndHeaders(
            rule,
            proxyData.response,
            uniqueId,
            sequentialIdGenerator
          )
        case 'url':
          return extractCorrelationBeginEndUrl(
            rule,
            proxyData.request,
            uniqueId,
            sequentialIdGenerator
          )
        default:
          return exhaustive(rule.extractor.selector)
      }
    case 'regex':
      switch (rule.extractor.selector.from) {
        case 'body':
          return extractCorrelationRegexBody(
            rule,
            proxyData.response,
            uniqueId,
            sequentialIdGenerator
          )
        case 'headers':
          return extractCorrelationRegexHeaders(
            rule,
            proxyData.response,
            uniqueId,
            sequentialIdGenerator
          )
        case 'url':
          return extractCorrelationRegexUrl(
            rule,
            proxyData.request,
            uniqueId,
            sequentialIdGenerator
          )
        default:
          return exhaustive(rule.extractor.selector)
      }
    case 'json':
      return extractCorrelationJsonBody(
        rule,
        proxyData.response,
        uniqueId,
        sequentialIdGenerator
      )
    default:
      return exhaustive(rule.extractor.selector)
  }
}

const extractCorrelationBeginEndBody = (
  rule: CorrelationRule,
  response: Response | undefined,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  // TODO: remove this obscenity!
  if (!response) {
    throw new Error('no response to extract from')
  }

  if (rule.extractor.selector.type !== 'begin-end') {
    throw new Error('operation on wrong rule type')
  }

  // Note: currently matches only the first occurrence
  const regex = new RegExp(
    `${rule.extractor.selector.begin}(.*?)${rule.extractor.selector.end}`
  )
  const match = response.content.match(regex)

  if (!match) {
    return {
      extractedValue: undefined,
      correlationExtractionSnippet: undefined,
      generatedUniqueId: undefined,
    }
  }

  if (!uniqueId) {
    uniqueId = sequentialIdGenerator.next().value
  }

  const correlationExtractionSnippet = `
var regex = new RegExp('${rule.extractor.selector.begin}(.*?)${rule.extractor.selector.end}')
var match = resp.body.match(regex)
let correl_${uniqueId}
if (match) {
  correl_${uniqueId} = match[1]
}
console.log('*********')
console.log(correl_${uniqueId})`
  return {
    extractedValue: match[1],
    correlationExtractionSnippet: correlationExtractionSnippet,
    generatedUniqueId: uniqueId,
  }
}

const extractCorrelationBeginEndHeaders = (
  rule: CorrelationRule,
  response: Response | undefined,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  if (!response) {
    throw new Error('no response to extract from')
  }
  // TODO: remove this obscenity!
  if (rule.extractor.selector.type !== 'begin-end') {
    throw new Error('operation on wrong rule type')
  }

  // Note: currently matches only the first occurrence
  const regex = new RegExp(
    `${rule.extractor.selector.begin}(.*?)${rule.extractor.selector.end}`
  )

  for (const [key, value] of response.headers) {
    const match = value.match(regex)

    if (match) {
      if (!uniqueId) {
        uniqueId = sequentialIdGenerator.next().value
      }
      // TODO: replace regex with findBetween from k6-utils once we have imports
      const correlationExtractionSnippet = `
var regex = new RegExp('${rule.extractor.selector.begin}(.*?)${rule.extractor.selector.end}')
var match = resp.headers["${canonicalHeaderKey(key)}"].match(regex)
let correl_${uniqueId}
if (match) {
correl_${uniqueId} = match[1]
}
console.log('*********')
console.log('HEADER')
console.log(correl_${uniqueId})`
      return {
        extractedValue: match[1],
        correlationExtractionSnippet: correlationExtractionSnippet,
        generatedUniqueId: uniqueId,
      }
    }
  }

  return {
    extractedValue: undefined,
    correlationExtractionSnippet: undefined,
    generatedUniqueId: undefined,
  }
}

const extractCorrelationBeginEndUrl = (
  rule: CorrelationRule,
  request: Request,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  // TODO: remove this obscenity!
  if (rule.extractor.selector.type !== 'begin-end') {
    throw new Error('operation on wrong rule type')
  }

  const regex = new RegExp(
    `${rule.extractor.selector.begin}(.*?)${rule.extractor.selector.end}`
  )
  const match = request.url.match(regex)

  if (!match) {
    return {
      extractedValue: undefined,
      correlationExtractionSnippet: undefined,
      generatedUniqueId: undefined,
    }
  }

  if (!uniqueId) {
    uniqueId = sequentialIdGenerator.next().value
  }

  const correlationExtractionSnippet = `
var regex = new RegExp('${rule.extractor.selector.begin}(.*?)${rule.extractor.selector.end}')
var match = resp.url.match(regex)
let correl_${uniqueId}
if (match) {
  correl_${uniqueId} = match[1]
}
console.log('*********')
console.log(correl_${uniqueId})`
  return {
    extractedValue: match[1],
    correlationExtractionSnippet: correlationExtractionSnippet,
    generatedUniqueId: uniqueId,
  }
}

const extractCorrelationRegexBody = (
  rule: CorrelationRule,
  response: Response | undefined,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  if (!response) {
    throw new Error('no response to extract from')
  }
  // Note: why does typescript complains about this, we can see the usage only on the regex path :(
  // TODO: remove this obscenity!
  if (rule.extractor.selector.type !== 'regex') {
    throw new Error('regex operation on wrong rule type')
  }

  // Note: currently matches only the first occurrence
  const regex = new RegExp(rule.extractor.selector.regex)
  const match = response.content.match(regex)

  if (!match) {
    return {
      extractedValue: undefined,
      correlationExtractionSnippet: undefined,
      generatedUniqueId: undefined,
    }
  }

  if (!uniqueId) {
    uniqueId = sequentialIdGenerator.next().value
  }

  const correlationExtractionSnippet = `
var regex = new RegExp('${rule.extractor.selector.regex}')
var match = resp.body.match(regex)
let correl_${uniqueId}
if (match) {
  correl_${uniqueId} = match[1]
}
console.log('*********')
console.log(correl_${uniqueId})`
  return {
    extractedValue: match[1],
    correlationExtractionSnippet: correlationExtractionSnippet,
    generatedUniqueId: uniqueId,
  }
}

const extractCorrelationRegexHeaders = (
  rule: CorrelationRule,
  response: Response | undefined,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  if (!response) {
    throw new Error('no response to extract from')
  }
  // Note: why does typescript complains about this, we can see the usage only on the regex path :(
  // TODO: remove this obscenity!
  if (rule.extractor.selector.type !== 'regex') {
    throw new Error('regex operation on wrong rule type')
  }

  // Note: currently matches only the first occurrence
  const regex = new RegExp(`${rule.extractor.selector.regex}`)

  for (const [key, value] of response.headers) {
    const match = value.match(regex)

    if (match) {
      if (!uniqueId) {
        uniqueId = sequentialIdGenerator.next().value
      }

      const correlationExtractionSnippet = `
var regex = new RegExp('${rule.extractor.selector.regex}')
var match = resp.headers["${canonicalHeaderKey(key)}"].match(regex)
let correl_${uniqueId}
if (match) {
correl_${uniqueId} = match[1]
}
console.log('*********')
console.log('HEADER')
console.log(correl_${uniqueId})`
      return {
        extractedValue: match[1],
        correlationExtractionSnippet,
        generatedUniqueId: uniqueId,
      }
    }
  }

  return {
    extractedValue: undefined,
    correlationExtractionSnippet: undefined,
    generatedUniqueId: undefined,
  }
}

const extractCorrelationRegexUrl = (
  rule: CorrelationRule,
  request: Request,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  // Note: why does typescript complains about this, we can see the usage only on the regex path :(
  // TODO: remove this obscenity!
  if (rule.extractor.selector.type !== 'regex') {
    throw new Error('regex operation on wrong rule type')
  }

  const regex = new RegExp(`${rule.extractor.selector.regex}`)
  const match = request.url.match(regex)

  if (!match) {
    return {
      extractedValue: undefined,
      correlationExtractionSnippet: undefined,
      generatedUniqueId: undefined,
    }
  }

  if (!uniqueId) {
    uniqueId = sequentialIdGenerator.next().value
  }

  const correlationExtractionSnippet = `
var regex = new RegExp('${rule.extractor.selector.regex}')
var match = resp.url.match(regex)
let correl_${uniqueId}
if (match) {
  correl_${uniqueId} = match[1]
}
console.log('*********')
console.log(correl_${uniqueId})`
  return {
    extractedValue: match[1],
    correlationExtractionSnippet: correlationExtractionSnippet,
    generatedUniqueId: uniqueId,
  }
}

const extractCorrelationJsonBody = (
  rule: CorrelationRule,
  response: Response | undefined,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  if (!response) {
    throw new Error('no response to extract from')
  }

  const contentTypeValues = getHeaderValues(response.headers, 'content-type')
  let contentTypeValue = contentTypeValues ? contentTypeValues[0] : undefined

  // NOTE: this is a small hack to skip google malformed json that starts this way, those requests are made automatically by the chrome
  // browser. Most likely we want a better way of filtering them out since it can't be just parsed
  if (response.content.startsWith(')]}')) {
    contentTypeValue = undefined
  }

  // works only on json
  if (!contentTypeValue || !contentTypeValue.includes('application/json')) {
    return {
      extractedValue: undefined,
      correlationExtractionSnippet: undefined,
      generatedUniqueId: undefined,
    }
  }

  // Note: why does typescript complains about this, we can see the usage only on the regex path :(
  // TODO: remove this obscenity! (create appropriate more fine-grained types)
  if (rule.extractor.selector.type !== 'json') {
    throw new Error('operation on wrong rule type')
  }

  const extractedValue = get(
    safeJsonParse(response.content),
    rule.extractor.selector.path
  )

  if (!extractedValue || extractedValue.length === 0) {
    return {
      extractedValue: undefined,
      correlationExtractionSnippet: undefined,
      generatedUniqueId: undefined,
    }
  }

  if (!uniqueId) {
    uniqueId = sequentialIdGenerator.next().value
  }

  const correlationExtractionSnippet = `
let correl_${uniqueId} = resp.json()${rule.extractor.selector.path}
console.log('*********')
console.log(correl_${uniqueId})`
  return {
    extractedValue: extractedValue[0],
    correlationExtractionSnippet: correlationExtractionSnippet,
    generatedUniqueId: uniqueId,
  }
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value)
  } catch (error) {
    console.error('Failed to parse JSON', error)
    return undefined
  }
}
