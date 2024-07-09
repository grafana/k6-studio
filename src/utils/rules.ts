/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { RequestSnippetSchema, Response, Request, ProxyData } from '@/types'
import {
  CustomCodeRule,
  TestRule,
  CorrelationRule,
  CorrelationStateMap,
} from '@/types/rules'
import { exhaustive } from '../utils/typescript'
import { cloneDeep } from 'lodash-es'
import { JSONPath } from 'jsonpath-plus'
import { getHeaderValues } from './headers'

export function applyRule(
  requestSnippetSchema: RequestSnippetSchema,
  rule: TestRule,
  correlationStateMap: CorrelationStateMap,
  sequentialIdGenerator: Generator<number>
): RequestSnippetSchema {
  switch (rule.type) {
    case 'customCode':
      return applyCustomCodeRule(requestSnippetSchema, rule)
    case 'correlation':
      return applyCorrelationRule(
        requestSnippetSchema,
        rule,
        correlationStateMap,
        sequentialIdGenerator
      )
    case 'parameterization':
    case 'verification':
      return requestSnippetSchema
    default:
      return exhaustive(rule)
  }
}

function applyCustomCodeRule(
  requestSnippetSchema: RequestSnippetSchema,
  rule: CustomCodeRule
): RequestSnippetSchema {
  const block = rule.placement === 'before' ? 'before' : 'after'

  return {
    ...requestSnippetSchema,
    [block]: [...requestSnippetSchema[block], rule.snippet],
  }
}

function applyCorrelationRule(
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
  let uniqueId
  if (correlationState?.extractedValue) {
    // we populate uniqueId since it doesn't have to be regenerated
    // this will be passed to the tryCorrelationExtraction function
    uniqueId = correlationState.generatedUniqueId

    // TODO: this is the global replacer when the replacer object is not configured, the replacer functioncality has to be implemented
    if (
      requestSnippetSchema.data.request.content.includes(
        correlationState.extractedValue
      )
    ) {
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
          correlationState.extractedValue,
          `\${correl_${correlationState.generatedUniqueId}}`
        )
      // headers
      const replacedRequestHeaders =
        requestSnippetSchema.data.request.headers.map(([key, value]) => {
          const replacedValue = value.replaceAll(
            correlationState.extractedValue!, // we know that we have this value since we just used it above..
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

  if (extractedValue) {
    if (correlationState) {
      // we only increment the count and we keep the first extracted value
      correlationState.count += 1
      // note: if the correlation extracts from URL we will need to showcase the request
      correlationState.responsesExtracted.push(requestSnippetSchema.data)
    } else {
      correlationStateMap[rule.id] = {
        extractedValue: extractedValue,
        count: 1,
        responsesExtracted: [requestSnippetSchema.data],
        requestsReplaced: [],
        generatedUniqueId: generatedUniqueId,
      }

      return {
        ...requestSnippetSchema,
        after: [
          ...requestSnippetSchema['after'],
          correlationExtractionSnippet!,
        ], // ! we know that we have the values because we are in the if condition but might need better types
      }
    }
  }

  // return requestSnippetSchema
  return snippetSchemaReturnValue
}

const tryCorrelationExtraction = (
  rule: CorrelationRule,
  proxyData: ProxyData,
  uniqueId: number | void,
  sequentialIdGenerator: Generator<number>
) => {
  // correlation works on responses so if we have no response we should return early except in case the selector is checking
  // the url, in that case the value is extracted from a request so it's fine to not have a response
  if (!proxyData.response) {
    if (
      'from' in rule.extractor.selector &&
      rule.extractor.selector.from === 'url'
    ) {
      // we do nothing
    } else {
      return {
        extractedValue: undefined,
        correlationExtractionSnippet: undefined,
        generatedUniqueId: undefined,
      }
    }
  }

  switch (rule.extractor.selector.type) {
    case 'begin-end':
      switch (rule.extractor.selector.from) {
        case 'body':
          return extractCorrelationBeginEndBody(
            rule,
            proxyData.response!,
            uniqueId,
            sequentialIdGenerator
          )
        case 'headers':
          return extractCorrelationBeginEndHeaders(
            rule,
            proxyData.response!,
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
      }
      break // <--- editor complains about missing break and then complains that break is unreachable :/
    case 'regex':
      switch (rule.extractor.selector.from) {
        case 'body':
          return extractCorrelationRegexBody(
            rule,
            proxyData.response!,
            uniqueId,
            sequentialIdGenerator
          )
        case 'headers':
          return extractCorrelationRegexHeaders(
            rule,
            proxyData.response!,
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
      }
      break // <--- editor complains about missing break and then complains that break is unreachable :/
    case 'json':
      return extractCorrelationJsonBody(
        rule,
        proxyData.response!,
        uniqueId,
        sequentialIdGenerator
      )
    case 'custom-code':
      return extractCorrelationCustomCode(
        rule,
        proxyData.response!,
        uniqueId,
        sequentialIdGenerator
      )
  }
  return {
    extractedValue: undefined,
    correlationExtractionSnippet: undefined,
    generatedUniqueId: undefined,
  }
}

const extractCorrelationBeginEndBody = (
  rule: CorrelationRule,
  response: Response,
  uniqueId: number | void | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  // TODO: remove this obscenity!
  if (rule.extractor.selector.type !== 'begin-end') {
    throw new Error('operation on wrong rule type')
  }

  // Note: currently matches only the first occurrence
  const regex = new RegExp(
    `${rule.extractor.selector.begin}(.*?)${rule.extractor.selector.end}`
  )
  const match = response.content.match(regex)

  if (match) {
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

  return {
    extractedValue: undefined,
    correlationExtractionSnippet: undefined,
    generatedUniqueId: undefined,
  }
}

const extractCorrelationBeginEndHeaders = (
  rule: CorrelationRule,
  response: Response,
  uniqueId: number | void | undefined,
  sequentialIdGenerator: Generator<number>
) => {
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
  uniqueId: number | void | undefined,
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

  if (match) {
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

  return {
    extractedValue: undefined,
    correlationExtractionSnippet: undefined,
    generatedUniqueId: undefined,
  }
}

const extractCorrelationRegexBody = (
  rule: CorrelationRule,
  response: Response,
  uniqueId: number | void | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  // Note: why does typescript complains about this, we can see the usage only on the regex path :(
  // TODO: remove this obscenity!
  if (rule.extractor.selector.type !== 'regex') {
    throw new Error('regex operation on wrong rule type')
  }

  // Note: currently matches only the first occurrence
  const regex = new RegExp(rule.extractor.selector.regex)
  const match = response.content.match(regex)

  if (match) {
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

  return {
    extractedValue: undefined,
    correlationExtractionSnippet: undefined,
    generatedUniqueId: undefined,
  }
}

const extractCorrelationRegexHeaders = (
  rule: CorrelationRule,
  response: Response,
  uniqueId: number | void | undefined,
  sequentialIdGenerator: Generator<number>
) => {
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

const extractCorrelationRegexUrl = (
  rule: CorrelationRule,
  request: Request,
  uniqueId: number | void | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  // Note: why does typescript complains about this, we can see the usage only on the regex path :(
  // TODO: remove this obscenity!
  if (rule.extractor.selector.type !== 'regex') {
    throw new Error('regex operation on wrong rule type')
  }

  const regex = new RegExp(`${rule.extractor.selector.regex}`)
  const match = request.url.match(regex)

  if (match) {
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

  return {
    extractedValue: undefined,
    correlationExtractionSnippet: undefined,
    generatedUniqueId: undefined,
  }
}

const extractCorrelationJsonBody = (
  rule: CorrelationRule,
  response: Response,
  uniqueId: number | void | undefined,
  sequentialIdGenerator: Generator<number>
) => {
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

  const extractedValue = JSONPath({
    path: `$${rule.extractor.selector.path}`,
    json: JSON.parse(response.content),
  })

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

const extractCorrelationCustomCode = (
  rule: CorrelationRule,
  response: Response,
  uniqueId: number | void | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  // Note: why does typescript complains about this, we can see the usage only on the regex path :(
  // TODO: remove this obscenity! (create appropriate more fine-grained types)
  if (rule.extractor.selector.type !== 'custom-code') {
    throw new Error('operation on wrong rule type')
  }

  const extractorFunctionSnippetWithoutId = `
function correlationCustomCode () {
  ${rule.extractor.selector.snippet}
}
correlationCustomCode()
`
  // NOTE: for the custom code rule to work correctly we would need the same api available in k6 in here.
  // Currently our response object are different and do not support methods like `json`.
  // TODO: implement a response object that behaves like in k6
  const resp = response
  resp // <--- just to please typescript about resp not being used while it's used in eval :/
  let extractedValue
  try {
    extractedValue = eval(extractorFunctionSnippetWithoutId)
    console.log(extractedValue)
  } catch (error) {
    // console.log(error)
    // Not sure if we should be reporting errors here since the process is the same so the rule gets
    // applied to every response, making error reporting meaningless/noisy :/
    // Most likely the fact that we report the responses that got extracted should suffice for debugging purposes
  }

  if (!extractedValue) {
    return {
      extractedValue: undefined,
      correlationExtractionSnippet: undefined,
      generatedUniqueId: undefined,
    }
  }

  if (!uniqueId) {
    uniqueId = sequentialIdGenerator.next().value
  }

  const extractorFunctionSnippet = `
function correlationCustomCode_${uniqueId} (resp) {
  ${rule.extractor.selector.snippet}
}
`

  const correlationExtractionSnippet = `
${extractorFunctionSnippet}
let correl_${uniqueId} = correlationCustomCode_${uniqueId}(resp)
console.log('*********')
console.log(correl_${uniqueId})`
  return {
    extractedValue: extractedValue,
    correlationExtractionSnippet: correlationExtractionSnippet,
    generatedUniqueId: uniqueId,
  }
}

/**
 * Converts a header key to its canonical form.
 * ex. content-type -> Content-Type
 */
function canonicalHeaderKey(headerKey: string) {
  return headerKey
    .toLowerCase()
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('-')
}

/**
 * Generates sequentials integers to be used for generated variables distinction for the final script.
 */
export function* generateSequentialInt() {
  let num = 0
  while (true) {
    yield num
    num += 1
  }
}
