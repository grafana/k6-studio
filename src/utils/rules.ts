import { RequestSnippetSchema, Response, Request, ProxyData } from '@/types'
import { CustomCodeRule, TestRule, CorrelationRule } from '@/types/rules'
import { exhaustive } from '../utils/typescript'
import { cloneDeep } from 'lodash-es'

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
    if (requestSnippetSchema.data.request.content.includes(correlationState.extractedValue)) {
      const originalRequest = cloneDeep(requestSnippetSchema.data.request)

      // default behaviour replaces all occurences of the string
      const replacedRequestContent = requestSnippetSchema.data.request.content.replaceAll(correlationState.extractedValue, `\${correl_${rule.id}}`)

      snippetSchemaReturnValue.data.request.content = replacedRequestContent
      // we clone to keep a reference even if the objects gets mutated further
      const modifiedRequest = cloneDeep(requestSnippetSchema.data.request)
      modifiedRequest.content = replacedRequestContent

      correlationState.requestsReplaced.push([originalRequest, modifiedRequest])
    }

  }

  // if we have no response and it's not a url correlation, we return early since we can't correlate without a response
  if (!requestSnippetSchema.data.response && rule.extractor.from !== 'url') {
    return snippetSchemaReturnValue
  }

  // try to extract the value
  const { extractedValue, correlationExtractionSnippet } = tryCorrelationExtraction(rule, requestSnippetSchema.data)

  if (extractedValue) {
    if (correlationState) {
      // we only increment the count and we keep the first extracted value
      correlationState.count += 1
      // TODO: need to add request instead when extracting from URL
      correlationState.responsesExtracted.push(requestSnippetSchema.data.response)
    } else {
      correlationsState[rule.id] = {
        extractedValue: extractedValue,
        count: 1,
        responsesExtracted: [requestSnippetSchema.data.response],
        requestsReplaced: []
      }

      return {
        ...requestSnippetSchema,
        after: [...requestSnippetSchema['after'], correlationExtractionSnippet],
      }
    }
  }

  // return requestSnippetSchema
  return snippetSchemaReturnValue
}

const tryCorrelationExtraction = (rule: CorrelationRule, proxyData: ProxyData) => {
  switch (rule.extractor.selector.type) {
    case 'begin-end':
      switch (rule.extractor.from) {
        case 'body':
          // TODO: we know that we have a response, how to make typescript accept it ?
          return extractCorrelationBeginEndBody(rule, proxyData.response)
        case 'headers':
          return extractCorrelationBeginEndHeaders(rule, proxyData.response)
        case 'url':
          return extractCorrelationBeginEndUrl(rule, proxyData.request)
        }
  }
  return {extractedValue: undefined, correlationExtractionSnippet: undefined}
}

const extractCorrelationBeginEndBody = (rule: CorrelationRule, response: Response) => {

  // Note: currently matches only the first occurrence
  const regex = new RegExp(`${rule.extractor.selector.begin}(.*?)${rule.extractor.selector.end}`)
  const match = response.content.match(regex)

  if (match) {

    const correlationExtractionSnippet = `
var regex = new RegExp('${rule.extractor.selector.begin}(.*?)${rule.extractor.selector.end}')
var match = resp.body.match(regex)
let correl_${rule.id}
if (match) {
  correl_${rule.id} = match[1]
}
console.log('*********')
console.log(correl_${rule.id})`
    return { extractedValue: match[1], correlationExtractionSnippet: correlationExtractionSnippet}
  }

  return {extractedValue: undefined, correlationExtractionSnippet: undefined}
}

const extractCorrelationBeginEndHeaders = (rule: CorrelationRule, response: Response) => {

  // Note: currently matches only the first occurrence
  const regex = new RegExp(`${rule.extractor.selector.begin}(.*?)${rule.extractor.selector.end}`)

  for (const [key, value] of response.headers) {

    const match = value.match(regex)

    if (match) {
      console.log(key)
      const correlationExtractionSnippet = `
var regex = new RegExp('${rule.extractor.selector.begin}(.*?)${rule.extractor.selector.end}')
var match = resp.headers["${canonicalHeaderKey(key)}"].match(regex)
let correl_${rule.id}
if (match) {
correl_${rule.id} = match[1]
}
console.log('*********')
console.log('HEADER')
console.log(correl_${rule.id})`
      return { extractedValue: match[1], correlationExtractionSnippet: correlationExtractionSnippet}
    }
  }

  return {extractedValue: undefined, correlationExtractionSnippet: undefined}
}

const extractCorrelationBeginEndUrl = (rule: CorrelationRule, request: Request) => {

  const regex = new RegExp(`${rule.extractor.selector.begin}(.*?)${rule.extractor.selector.end}`)
  const match = request.url.match(regex)

  if (match) {

    const correlationExtractionSnippet = `
var regex = new RegExp('${rule.extractor.selector.begin}(.*?)${rule.extractor.selector.end}')
var match = resp.url.match(regex)
let correl_${rule.id}
if (match) {
  correl_${rule.id} = match[1]
}
console.log('*********')
console.log(correl_${rule.id})`
    return { extractedValue: match[1], correlationExtractionSnippet: correlationExtractionSnippet}
  }

  return {extractedValue: undefined, correlationExtractionSnippet: undefined}
}

/**
 * Converts a header key to its canonical form.
 * ex. content-type -> Content-Type
 */
function canonicalHeaderKey(headerKey: string) {
  return headerKey
    .toLowerCase()
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('-');
}

// TODO: needs to be a store ?
interface CorrelationState {
  extractedValue?: string
  count: number
  responsesExtracted: Response[]
  requestsReplaced: [Request, Request][]
}

// TODO: this needs to be reset
const correlationsState: Record<string, CorrelationState> = {}
