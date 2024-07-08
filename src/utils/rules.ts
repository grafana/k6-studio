/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { RequestSnippetSchema, Response, Request, ProxyData } from '@/types'
import { CustomCodeRule, TestRule, CorrelationRule } from '@/types/rules'
import { exhaustive } from '../utils/typescript'
import { cloneDeep } from 'lodash-es'
import { JSONPath } from 'jsonpath-plus'
import { getHeaderValues } from './headers'

export function applyRule(
  requestSnippetSchema: RequestSnippetSchema,
  rule: TestRule
): RequestSnippetSchema {
  switch (rule.type) {
    case 'customCode':
      return applyCustomCodeRule(requestSnippetSchema, rule)
    case 'correlation':
      return applyCorrelationRule(requestSnippetSchema, rule)
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
  rule: CorrelationRule
): RequestSnippetSchema {
  // this is the modified schema that we return to the accumulator
  const snippetSchemaReturnValue = cloneDeep(requestSnippetSchema)
  // snippetSchemaReturnValue.data.request.content = 'helloworld'

  // if we have an extracted value we try to apply it to the request
  // note: this comes before the extractor to avoid applying an extracted value on the same request/response pair
  const correlationState = correlationsState[rule.id]
  if (correlationState?.extractedValue) {
    if (
      requestSnippetSchema.data.request.content.includes(
        correlationState.extractedValue
      )
    ) {
      const originalRequest = cloneDeep(requestSnippetSchema.data.request)

      // default behaviour replaces all occurences of the string
      const replacedRequestContent =
        requestSnippetSchema.data.request.content.replaceAll(
          correlationState.extractedValue,
          `\${correl_${correlationState.generatedUniqueId}}`
        )

      snippetSchemaReturnValue.data.request.content = replacedRequestContent
      // we clone to keep a reference even if the objects gets mutated further
      const modifiedRequest = cloneDeep(requestSnippetSchema.data.request)
      modifiedRequest.content = replacedRequestContent

      correlationState.requestsReplaced.push([originalRequest, modifiedRequest])
    }
  }

  // try to extract the value
  const { extractedValue, correlationExtractionSnippet, generatedUniqueId } =
    tryCorrelationExtraction(rule, requestSnippetSchema.data)

  if (extractedValue) {
    if (correlationState) {
      // we only increment the count and we keep the first extracted value
      correlationState.count += 1
      // note: if the correlation extracts from URL we will need to showcase the request
      correlationState.responsesExtracted.push(requestSnippetSchema.data)
    } else {
      correlationsState[rule.id] = {
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
  proxyData: ProxyData
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
          // TODO: we know that we have a response, how to make typescript accept it ?
          return extractCorrelationBeginEndBody(rule, proxyData.response!)
        case 'headers':
          return extractCorrelationBeginEndHeaders(rule, proxyData.response!)
        case 'url':
          return extractCorrelationBeginEndUrl(rule, proxyData.request)
      }
      break // <--- editor complains about missing break and then complains that break is unreachable :/
    case 'regex':
      switch (rule.extractor.selector.from) {
        case 'body':
          // TODO: we know that we have a response, how to make typescript accept it ?
          return extractCorrelationRegexBody(rule, proxyData.response!)
        case 'headers':
          return extractCorrelationRegexHeaders(rule, proxyData.response!)
        case 'url':
          return extractCorrelationRegexUrl(rule, proxyData.request)
      }
      break // <--- editor complains about missing break and then complains that break is unreachable :/
    case 'json':
      // TODO: we know that we have a response, how to make typescript accept it ?
      return extractCorrelationJsonBody(rule, proxyData.response!)
    case 'custom-code':
      // TODO: we know that we have a response, how to make typescript accept it ?
      return extractCorrelationCustomCode(rule, proxyData.response!)
  }
  return {
    extractedValue: undefined,
    correlationExtractionSnippet: undefined,
    generatedUniqueId: undefined,
  }
}

const extractCorrelationBeginEndBody = (
  rule: CorrelationRule,
  response: Response
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
    const uniqueId = sequentialIdGenerator.next().value

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
  response: Response
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
      const uniqueId = sequentialIdGenerator.next().value
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
  request: Request
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
    const uniqueId = sequentialIdGenerator.next().value

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
  response: Response
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
    const uniqueId = sequentialIdGenerator.next().value

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
  response: Response
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
      const uniqueId = sequentialIdGenerator.next().value

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
  request: Request
) => {
  // Note: why does typescript complains about this, we can see the usage only on the regex path :(
  // TODO: remove this obscenity!
  if (rule.extractor.selector.type !== 'regex') {
    throw new Error('regex operation on wrong rule type')
  }

  const regex = new RegExp(`${rule.extractor.selector.regex}`)
  const match = request.url.match(regex)

  if (match) {
    const uniqueId = sequentialIdGenerator.next().value

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
  response: Response
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

  const uniqueId = sequentialIdGenerator.next().value

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
  response: Response
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
    // TODO: we need to report this error to the frontned
    // this can be done when the uniqueId is migrated
  }

  if (!extractedValue) {
    return {
      extractedValue: undefined,
      correlationExtractionSnippet: undefined,
      generatedUniqueId: undefined,
    }
  }

  const uniqueId = sequentialIdGenerator.next().value

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

interface CorrelationState {
  extractedValue?: string
  count: number
  responsesExtracted: ProxyData[]
  requestsReplaced: [Request, Request][]
  generatedUniqueId: number | void | undefined
}

// TODO: these needs to be reset
const correlationsState: Record<string, CorrelationState> = {}
const sequentialIdGenerator = generateSequentialInt()

/**
 * Generates sequentials integers to be used for generated variables distinction for the final script.
 */
function* generateSequentialInt() {
  let num = 0
  while (true) {
    yield num
    num += 1
  }
}
