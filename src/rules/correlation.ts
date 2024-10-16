import { ProxyData, RequestSnippetSchema, Response, Request } from '@/types'
import {
  CorrelationStateMap,
  CorrelationRule,
  BeginEndSelector,
  RegexSelector,
  JsonSelector,
} from '@/types/rules'
import { cloneDeep, escapeRegExp, isEqual } from 'lodash-es'
import {
  canonicalHeaderKey,
  matchFilter,
  generateSequentialInt,
  isJsonReqResp,
} from './utils'
import { exhaustive } from '@/utils/typescript'
import { replaceCorrelatedValues } from './correlation.utils'
import { matchBeginEnd, matchRegex, getJsonObjectFromPath } from './shared'

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
    const { extractedValue } = correlationState
    // we populate uniqueId since it doesn't have to be regenerated
    // this will be passed to the tryCorrelationExtraction function
    uniqueId = correlationState.generatedUniqueId

    snippetSchemaReturnValue.data.request = replaceCorrelatedValues({
      rule,
      extractedValue,
      uniqueId: uniqueId ?? 0,
      request: requestSnippetSchema.data.request,
    })

    // Keep track of modified requests to display in preview
    if (!isEqual(requestSnippetSchema, snippetSchemaReturnValue)) {
      correlationState.requestsReplaced.push([
        requestSnippetSchema.data.request,
        snippetSchemaReturnValue.data.request,
      ])
    }
  }

  // Skip extraction if filter doesn't match
  if (!matchFilter(requestSnippetSchema, rule)) {
    return snippetSchemaReturnValue
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

  return snippetSchemaReturnValue
}

const noCorrelationResult = {
  extractedValue: undefined,
  correlationExtractionSnippet: undefined,
  generatedUniqueId: undefined,
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
    return noCorrelationResult
  }

  switch (rule.extractor.selector.type) {
    case 'begin-end':
      return extractCorrelationBeginEnd(
        rule.extractor.selector,
        proxyData,
        uniqueId,
        sequentialIdGenerator
      )
    case 'regex':
      return extractCorrelationRegex(
        rule.extractor.selector,
        proxyData,
        uniqueId,
        sequentialIdGenerator
      )
    case 'json':
      return extractCorrelationJsonBody(
        rule.extractor.selector,
        proxyData.response,
        uniqueId,
        sequentialIdGenerator
      )
    default:
      return exhaustive(rule.extractor.selector)
  }
}

const extractCorrelationBeginEnd = (
  selector: BeginEndSelector,
  proxyData: ProxyData,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  switch (selector.from) {
    case 'body':
      return extractCorrelationBeginEndBody(
        selector,
        proxyData.response,
        uniqueId,
        sequentialIdGenerator
      )
    case 'headers':
      return extractCorrelationBeginEndHeaders(
        selector,
        proxyData.response,
        uniqueId,
        sequentialIdGenerator
      )
    case 'url':
      return extractCorrelationBeginEndUrl(
        selector,
        proxyData.request,
        uniqueId,
        sequentialIdGenerator
      )
    default:
      return exhaustive(selector.from)
  }
}

const extractCorrelationRegex = (
  selector: RegexSelector,
  proxyData: ProxyData,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  switch (selector.from) {
    case 'body':
      return extractCorrelationRegexBody(
        selector,
        proxyData.response,
        uniqueId,
        sequentialIdGenerator
      )
    case 'headers':
      return extractCorrelationRegexHeaders(
        selector,
        proxyData.response,
        uniqueId,
        sequentialIdGenerator
      )
    case 'url':
      return extractCorrelationRegexUrl(
        selector,
        proxyData.request,
        uniqueId,
        sequentialIdGenerator
      )
    default:
      return exhaustive(selector.from)
  }
}

const getCorrelationVariableSnippet = (uniqueId: number) => {
  return `if (match) {
      correlation_vars['correlation_${uniqueId}'] = match[1]
    }`
}

const getCorrelationBeginEndSnippet = (
  selector: BeginEndSelector,
  matchStatement: string,
  uniqueId: number
) => {
  const begin = escapeRegExp(selector.begin)
  const end = escapeRegExp(selector.end)

  // TODO: replace regex with findBetween from k6-utils once we have imports
  return `
    regex = new RegExp('${begin}(.*?)${end}')
    match = ${matchStatement}
    ${getCorrelationVariableSnippet(uniqueId)}`
}

const getCorrelationRegexSnippet = (
  selector: RegexSelector,
  matchStatement: string,
  uniqueId: number
) => {
  return `
    regex = new RegExp('${selector.regex}')
    match = ${matchStatement}
    ${getCorrelationVariableSnippet(uniqueId)}`
}

const extractCorrelationBeginEndBody = (
  selector: BeginEndSelector,
  response: Response | undefined,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  if (!response) {
    throw new Error('no response to extract from')
  }

  const extractedValue = matchBeginEnd(
    response.content,
    selector.begin,
    selector.end
  )

  if (!extractedValue) {
    return noCorrelationResult
  }

  const generatedUniqueId = uniqueId ?? sequentialIdGenerator.next().value

  const correlationExtractionSnippet = getCorrelationBeginEndSnippet(
    selector,
    'resp.body.match(regex)',
    generatedUniqueId
  )

  return {
    extractedValue,
    correlationExtractionSnippet,
    generatedUniqueId,
  }
}

const extractCorrelationBeginEndHeaders = (
  selector: BeginEndSelector,
  response: Response | undefined,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  if (!response) {
    throw new Error('no response to extract from')
  }

  // Note: currently matches only the first occurrence
  for (const [key, value] of response.headers) {
    const extractedValue = matchBeginEnd(value, selector.begin, selector.end)

    if (!extractedValue) {
      continue
    }

    const generatedUniqueId = uniqueId ?? sequentialIdGenerator.next().value
    const correlationExtractionSnippet = getCorrelationBeginEndSnippet(
      selector,
      `resp.headers["${canonicalHeaderKey(key)}"].match(regex)`,
      generatedUniqueId
    )

    return {
      extractedValue,
      correlationExtractionSnippet,
      generatedUniqueId,
    }
  }

  return noCorrelationResult
}

const extractCorrelationBeginEndUrl = (
  selector: BeginEndSelector,
  request: Request,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  const extractedValue = matchBeginEnd(
    request.url,
    selector.begin,
    selector.end
  )

  if (!extractedValue) {
    return noCorrelationResult
  }

  const generatedUniqueId = uniqueId ?? sequentialIdGenerator.next().value

  const correlationExtractionSnippet = getCorrelationBeginEndSnippet(
    selector,
    'resp.url.match(regex)',
    generatedUniqueId
  )

  return {
    extractedValue,
    correlationExtractionSnippet,
    generatedUniqueId,
  }
}

const extractCorrelationRegexBody = (
  selector: RegexSelector,
  response: Response | undefined,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  if (!response) {
    throw new Error('no response to extract from')
  }

  const extractedValue = matchRegex(response.content, selector.regex)

  if (!extractedValue) {
    return noCorrelationResult
  }

  const generatedUniqueId = uniqueId ?? sequentialIdGenerator.next().value

  const correlationExtractionSnippet = getCorrelationRegexSnippet(
    selector,
    'resp.body.match(regex)',
    generatedUniqueId
  )

  return {
    extractedValue,
    correlationExtractionSnippet,
    generatedUniqueId,
  }
}

const extractCorrelationRegexHeaders = (
  selector: RegexSelector,
  response: Response | undefined,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  if (!response) {
    throw new Error('no response to extract from')
  }

  // Note: currently matches only the first occurrence
  for (const [key, value] of response.headers) {
    const extractedValue = matchRegex(value, selector.regex)

    if (!extractedValue) {
      continue
    }

    const generatedUniqueId = uniqueId ?? sequentialIdGenerator.next().value

    const correlationExtractionSnippet = getCorrelationRegexSnippet(
      selector,
      `resp.headers["${canonicalHeaderKey(key)}"].match(regex)`,
      generatedUniqueId
    )

    return {
      extractedValue,
      correlationExtractionSnippet,
      generatedUniqueId,
    }
  }

  return noCorrelationResult
}

const extractCorrelationRegexUrl = (
  selector: RegexSelector,
  request: Request,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  const extractedValue = matchRegex(request.url, selector.regex)

  if (!extractedValue) {
    return noCorrelationResult
  }

  const generatedUniqueId = uniqueId ?? sequentialIdGenerator.next().value

  const correlationExtractionSnippet = getCorrelationRegexSnippet(
    selector,
    'resp.url.match(regex)',
    generatedUniqueId
  )

  return {
    extractedValue,
    correlationExtractionSnippet,
    generatedUniqueId,
  }
}

const extractCorrelationJsonBody = (
  selector: JsonSelector,
  response: Response | undefined,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  if (!response) {
    throw new Error('no response to extract from')
  }

  if (!isJsonReqResp(response)) {
    return noCorrelationResult
  }

  const extractedValue = getJsonObjectFromPath(response.content, selector.path)

  if (!extractedValue || extractedValue.length === 0) {
    return noCorrelationResult
  }

  const generatedUniqueId = uniqueId ?? sequentialIdGenerator.next().value

  // array indexing doesn't start with a dot so we add it only in the other cases
  const json_path = selector.path.startsWith('[')
    ? selector.path
    : `.${selector.path}`

  const correlationExtractionSnippet = `
correlation_vars['correlation_${generatedUniqueId}'] = resp.json()${json_path}`
  return {
    extractedValue,
    correlationExtractionSnippet,
    generatedUniqueId,
  }
}

// @ts-expect-error we have commonjs set as module option
if (import.meta.vitest) {
  // @ts-expect-error we have commonjs set as module option
  const { it, expect } = import.meta.vitest

  const generateResponse = (content: string): Response => {
    return {
      statusCode: 200,
      path: '/api/v1/foo',
      reason: 'OK',
      httpVersion: '1.1',
      headers: [['Content-Type', 'application/json']],
      cookies: [],
      content: content,
      contentLength: 0,
      timestampStart: 0,
    }
  }

  const generateRequest = (): Request => {
    return {
      method: 'POST',
      url: 'http://test.k6.io/api/v1/foo',
      headers: [],
      cookies: [],
      query: [],
      scheme: 'http',
      host: 'localhost:3000',
      content: '',
      path: '/api/v1/foo',
      timestampStart: 0,
      timestampEnd: 0,
      contentLength: 0,
      httpVersion: '1.1',
    }
  }

  it('extract correlation json body', () => {
    const sequentialIdGenerator = generateSequentialInt()
    const response: Response = generateResponse(
      JSON.stringify({ user_id: '444' })
    )

    const selector: JsonSelector = {
      type: 'json',
      from: 'body',
      path: 'user_id',
    }

    const correlationExtractionSnippet = `
correlation_vars['correlation_1'] = resp.json().user_id`
    const expectedResult = {
      extractedValue: '444',
      correlationExtractionSnippet,
      generatedUniqueId: 1,
    }

    expect(
      extractCorrelationJsonBody(selector, response, 1, sequentialIdGenerator)
    ).toStrictEqual(expectedResult)
  })

  it('extract correlation begin end body', () => {
    const sequentialIdGenerator = generateSequentialInt()
    const response: Response = generateResponse('noise<hello>bob<world>blah')

    const selector: BeginEndSelector = {
      type: 'begin-end',
      from: 'body',
      begin: 'hello>',
      end: '<world>',
    }

    const correlationExtractionSnippet = `
    regex = new RegExp('${selector.begin}(.*?)${selector.end}')
    match = resp.body.match(regex)
    if (match) {
      correlation_vars['correlation_1'] = match[1]
    }`
    const expectedResult = {
      extractedValue: 'bob',
      correlationExtractionSnippet,
      generatedUniqueId: 1,
    }

    expect(
      extractCorrelationBeginEndBody(
        selector,
        response,
        1,
        sequentialIdGenerator
      )
    ).toStrictEqual(expectedResult)
  })

  it('extract correlation begin end header', () => {
    const sequentialIdGenerator = generateSequentialInt()
    const response: Response = generateResponse('')

    const selector: BeginEndSelector = {
      type: 'begin-end',
      from: 'headers',
      begin: 'application',
      end: 'json',
    }

    const correlationExtractionSnippet = `
    regex = new RegExp('${selector.begin}(.*?)${selector.end}')
    match = resp.headers["${canonicalHeaderKey('Content-type')}"].match(regex)
    if (match) {
      correlation_vars['correlation_1'] = match[1]
    }`
    const expectedResult = {
      extractedValue: '/',
      correlationExtractionSnippet,
      generatedUniqueId: 1,
    }

    expect(
      extractCorrelationBeginEndHeaders(
        selector,
        response,
        1,
        sequentialIdGenerator
      )
    ).toStrictEqual(expectedResult)
  })

  it('extract correlation begin end url', () => {
    const sequentialIdGenerator = generateSequentialInt()
    const request: Request = generateRequest()

    const selector: BeginEndSelector = {
      type: 'begin-end',
      from: 'url',
      begin: 'api/',
      end: '/foo',
    }

    const correlationExtractionSnippet = `
    regex = new RegExp('${selector.begin}(.*?)${selector.end}')
    match = resp.url.match(regex)
    if (match) {
      correlation_vars['correlation_1'] = match[1]
    }`
    const expectedResult = {
      extractedValue: 'v1',
      correlationExtractionSnippet,
      generatedUniqueId: 1,
    }

    expect(
      extractCorrelationBeginEndUrl(selector, request, 1, sequentialIdGenerator)
    ).toStrictEqual(expectedResult)
  })

  it('extract correlation regex body', () => {
    const sequentialIdGenerator = generateSequentialInt()
    const response: Response = generateResponse('noise<hello>bob<world>blah')

    const selector: RegexSelector = {
      type: 'regex',
      from: 'body',
      regex: 'hello>(.*?)<world>',
    }

    const correlationExtractionSnippet = `
    regex = new RegExp('${selector.regex}')
    match = resp.body.match(regex)
    if (match) {
      correlation_vars['correlation_1'] = match[1]
    }`
    const expectedResult = {
      extractedValue: 'bob',
      correlationExtractionSnippet,
      generatedUniqueId: 1,
    }

    expect(
      extractCorrelationRegexBody(selector, response, 1, sequentialIdGenerator)
    ).toStrictEqual(expectedResult)
  })

  it('extract correlation regex header', () => {
    const sequentialIdGenerator = generateSequentialInt()
    const response: Response = generateResponse('')

    const selector: RegexSelector = {
      type: 'regex',
      from: 'headers',
      regex: 'application(.*?)json',
    }

    const correlationExtractionSnippet = `
    regex = new RegExp('${selector.regex}')
    match = resp.headers["${canonicalHeaderKey('Content-type')}"].match(regex)
    if (match) {
      correlation_vars['correlation_1'] = match[1]
    }`
    const expectedResult = {
      extractedValue: '/',
      correlationExtractionSnippet,
      generatedUniqueId: 1,
    }

    expect(
      extractCorrelationRegexHeaders(
        selector,
        response,
        1,
        sequentialIdGenerator
      )
    ).toStrictEqual(expectedResult)
  })

  it('extract correlation regex url', () => {
    const sequentialIdGenerator = generateSequentialInt()
    const request: Request = generateRequest()

    const selector: RegexSelector = {
      type: 'regex',
      from: 'url',
      regex: 'api/(.*?)/foo',
    }

    const correlationExtractionSnippet = `
    regex = new RegExp('${selector.regex}')
    match = resp.url.match(regex)
    if (match) {
      correlation_vars['correlation_1'] = match[1]
    }`
    const expectedResult = {
      extractedValue: 'v1',
      correlationExtractionSnippet,
      generatedUniqueId: 1,
    }

    expect(
      extractCorrelationRegexUrl(selector, request, 1, sequentialIdGenerator)
    ).toStrictEqual(expectedResult)
  })
}
