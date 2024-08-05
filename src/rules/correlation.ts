import { ProxyData, RequestSnippetSchema, Response, Request } from '@/types'
import {
  CorrelationStateMap,
  CorrelationRule,
  CorrelationRuleBeginEnd,
  CorrelationRuleRegex,
  CorrelationRuleJson,
} from '@/types/rules'
import { cloneDeep, isEqual } from 'lodash-es'
import {
  canonicalHeaderKey,
  matchFilter,
  generateSequentialInt,
  isJsonResponse,
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
        rule as CorrelationRuleBeginEnd,
        proxyData,
        uniqueId,
        sequentialIdGenerator
      )
    case 'regex':
      return extractCorrelationRegex(
        rule as CorrelationRuleRegex,
        proxyData,
        uniqueId,
        sequentialIdGenerator
      )
    case 'json':
      return extractCorrelationJsonBody(
        rule as CorrelationRuleJson,
        proxyData.response,
        uniqueId,
        sequentialIdGenerator
      )
    default:
      return exhaustive(rule.extractor.selector)
  }
}

const extractCorrelationBeginEnd = (
  rule: CorrelationRuleBeginEnd,
  proxyData: ProxyData,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
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
      return exhaustive(rule.extractor.selector.from)
  }
}

const extractCorrelationRegex = (
  rule: CorrelationRuleRegex,
  proxyData: ProxyData,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
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
      return exhaustive(rule.extractor.selector.from)
  }
}

const getCorrelationVariableSnippet = (uniqueId: number | undefined) => {
  return `let correl_${uniqueId}
    if (match) {
      correl_${uniqueId} = match[1]
    }`
}

const getCorrelationBeginEndSnippet = (
  rule: CorrelationRuleBeginEnd,
  matchStatement: string,
  uniqueId: number | undefined
) => {
  // TODO: replace regex with findBetween from k6-utils once we have imports
  return `
    regex = new RegExp('${rule.extractor.selector.begin}(.*?)${rule.extractor.selector.end}')
    match = ${matchStatement}
    ${getCorrelationVariableSnippet(uniqueId)}`
}

const getCorrelationRegexSnippet = (
  rule: CorrelationRuleRegex,
  matchStatement: string,
  uniqueId: number | undefined
) => {
  return `
    regex = new RegExp('${rule.extractor.selector.regex}')
    match = ${matchStatement}
    ${getCorrelationVariableSnippet(uniqueId)}`
}

const extractCorrelationBeginEndBody = (
  rule: CorrelationRuleBeginEnd,
  response: Response | undefined,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  if (!response) {
    throw new Error('no response to extract from')
  }

  const extractedValue = matchBeginEnd(
    response.content,
    rule.extractor.selector.begin,
    rule.extractor.selector.end
  )

  if (!extractedValue) {
    return noCorrelationResult
  }

  if (!uniqueId) {
    uniqueId = sequentialIdGenerator.next().value
  }

  const correlationExtractionSnippet = getCorrelationBeginEndSnippet(
    rule,
    'resp.body.match(regex)',
    uniqueId
  )

  return {
    extractedValue,
    correlationExtractionSnippet: correlationExtractionSnippet,
    generatedUniqueId: uniqueId,
  }
}

const extractCorrelationBeginEndHeaders = (
  rule: CorrelationRuleBeginEnd,
  response: Response | undefined,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  if (!response) {
    throw new Error('no response to extract from')
  }

  // Note: currently matches only the first occurrence
  for (const [key, value] of response.headers) {
    const extractedValue = matchBeginEnd(
      value,
      rule.extractor.selector.begin,
      rule.extractor.selector.end
    )

    if (extractedValue) {
      if (!uniqueId) {
        uniqueId = sequentialIdGenerator.next().value
      }
      const correlationExtractionSnippet = getCorrelationBeginEndSnippet(
        rule,
        `resp.headers["${canonicalHeaderKey(key)}"].match(regex)`,
        uniqueId
      )

      return {
        extractedValue,
        correlationExtractionSnippet: correlationExtractionSnippet,
        generatedUniqueId: uniqueId,
      }
    }
  }

  return noCorrelationResult
}

const extractCorrelationBeginEndUrl = (
  rule: CorrelationRuleBeginEnd,
  request: Request,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  const extractedValue = matchBeginEnd(
    request.url,
    rule.extractor.selector.begin,
    rule.extractor.selector.end
  )

  if (!extractedValue) {
    return noCorrelationResult
  }

  if (!uniqueId) {
    uniqueId = sequentialIdGenerator.next().value
  }

  const correlationExtractionSnippet = getCorrelationBeginEndSnippet(
    rule,
    'resp.url.match(regex)',
    uniqueId
  )

  return {
    extractedValue,
    correlationExtractionSnippet: correlationExtractionSnippet,
    generatedUniqueId: uniqueId,
  }
}

const extractCorrelationRegexBody = (
  rule: CorrelationRuleRegex,
  response: Response | undefined,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  if (!response) {
    throw new Error('no response to extract from')
  }

  const extractedValue = matchRegex(
    response.content,
    rule.extractor.selector.regex
  )

  if (!extractedValue) {
    return noCorrelationResult
  }

  if (!uniqueId) {
    uniqueId = sequentialIdGenerator.next().value
  }

  const correlationExtractionSnippet = getCorrelationRegexSnippet(
    rule,
    'resp.body.match(regex)',
    uniqueId
  )

  return {
    extractedValue,
    correlationExtractionSnippet: correlationExtractionSnippet,
    generatedUniqueId: uniqueId,
  }
}

const extractCorrelationRegexHeaders = (
  rule: CorrelationRuleRegex,
  response: Response | undefined,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  if (!response) {
    throw new Error('no response to extract from')
  }

  // Note: currently matches only the first occurrence
  for (const [key, value] of response.headers) {
    const extractedValue = matchRegex(value, rule.extractor.selector.regex)

    if (extractedValue) {
      if (!uniqueId) {
        uniqueId = sequentialIdGenerator.next().value
      }

      const correlationExtractionSnippet = getCorrelationRegexSnippet(
        rule,
        `resp.headers["${canonicalHeaderKey(key)}"].match(regex)`,
        uniqueId
      )

      return {
        extractedValue,
        correlationExtractionSnippet,
        generatedUniqueId: uniqueId,
      }
    }
  }

  return noCorrelationResult
}

const extractCorrelationRegexUrl = (
  rule: CorrelationRuleRegex,
  request: Request,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  const extractedValue = matchRegex(request.url, rule.extractor.selector.regex)

  if (!extractedValue) {
    return noCorrelationResult
  }

  if (!uniqueId) {
    uniqueId = sequentialIdGenerator.next().value
  }

  const correlationExtractionSnippet = getCorrelationRegexSnippet(
    rule,
    'resp.url.match(regex)',
    uniqueId
  )

  return {
    extractedValue,
    correlationExtractionSnippet: correlationExtractionSnippet,
    generatedUniqueId: uniqueId,
  }
}

const extractCorrelationJsonBody = (
  rule: CorrelationRuleJson,
  response: Response | undefined,
  uniqueId: number | undefined,
  sequentialIdGenerator: Generator<number>
) => {
  if (!response) {
    throw new Error('no response to extract from')
  }

  if (!isJsonResponse(response)) {
    return noCorrelationResult
  }

  const extractedValue = getJsonObjectFromPath(
    response.content,
    rule.extractor.selector.path
  )

  if (!extractedValue || extractedValue.length === 0) {
    return noCorrelationResult
  }

  if (!uniqueId) {
    uniqueId = sequentialIdGenerator.next().value
  }

  // array indexing doesn't start with a dot so we add it only in the other cases
  const json_path = rule.extractor.selector.path.startsWith('[')
    ? rule.extractor.selector.path
    : `.${rule.extractor.selector.path}`

  const correlationExtractionSnippet = `
let correl_${uniqueId} = resp.json()${json_path}`
  return {
    extractedValue,
    correlationExtractionSnippet: correlationExtractionSnippet,
    generatedUniqueId: uniqueId,
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

    const rule: CorrelationRuleJson = {
      type: 'correlation',
      id: '1',
      extractor: {
        filter: { path: '' },
        selector: {
          type: 'json',
          from: 'body',
          path: 'user_id',
        },
      },
    }

    const correlationExtractionSnippet = `
let correl_1 = resp.json().user_id`
    const expectedResult = {
      extractedValue: '444',
      correlationExtractionSnippet: correlationExtractionSnippet,
      generatedUniqueId: 1,
    }

    expect(
      extractCorrelationJsonBody(rule, response, 1, sequentialIdGenerator)
    ).toStrictEqual(expectedResult)
  })

  it('extract correlation begin end body', () => {
    const sequentialIdGenerator = generateSequentialInt()
    const response: Response = generateResponse('noise<hello>bob<world>blah')

    const rule: CorrelationRuleBeginEnd = {
      type: 'correlation',
      id: '1',
      extractor: {
        filter: { path: '' },
        selector: {
          type: 'begin-end',
          from: 'body',
          begin: 'hello>',
          end: '<world>',
        },
      },
    }

    const correlationExtractionSnippet = `
    regex = new RegExp('${rule.extractor.selector.begin}(.*?)${rule.extractor.selector.end}')
    match = resp.body.match(regex)
    let correl_1
    if (match) {
      correl_1 = match[1]
    }`
    const expectedResult = {
      extractedValue: 'bob',
      correlationExtractionSnippet: correlationExtractionSnippet,
      generatedUniqueId: 1,
    }

    expect(
      extractCorrelationBeginEndBody(rule, response, 1, sequentialIdGenerator)
    ).toStrictEqual(expectedResult)
  })

  it('extract correlation begin end header', () => {
    const sequentialIdGenerator = generateSequentialInt()
    const response: Response = generateResponse('')

    const rule: CorrelationRuleBeginEnd = {
      type: 'correlation',
      id: '1',
      extractor: {
        filter: { path: '' },
        selector: {
          type: 'begin-end',
          from: 'headers',
          begin: 'application',
          end: 'json',
        },
      },
    }

    const correlationExtractionSnippet = `
    regex = new RegExp('${rule.extractor.selector.begin}(.*?)${rule.extractor.selector.end}')
    match = resp.headers["${canonicalHeaderKey('Content-type')}"].match(regex)
    let correl_1
    if (match) {
      correl_1 = match[1]
    }`
    const expectedResult = {
      extractedValue: '/',
      correlationExtractionSnippet: correlationExtractionSnippet,
      generatedUniqueId: 1,
    }

    expect(
      extractCorrelationBeginEndHeaders(
        rule,
        response,
        1,
        sequentialIdGenerator
      )
    ).toStrictEqual(expectedResult)
  })

  it('extract correlation begin end url', () => {
    const sequentialIdGenerator = generateSequentialInt()
    const request: Request = generateRequest()

    const rule: CorrelationRuleBeginEnd = {
      type: 'correlation',
      id: '1',
      extractor: {
        filter: { path: '' },
        selector: {
          type: 'begin-end',
          from: 'url',
          begin: 'api/',
          end: '/foo',
        },
      },
    }

    const correlationExtractionSnippet = `
    regex = new RegExp('${rule.extractor.selector.begin}(.*?)${rule.extractor.selector.end}')
    match = resp.url.match(regex)
    let correl_1
    if (match) {
      correl_1 = match[1]
    }`
    const expectedResult = {
      extractedValue: 'v1',
      correlationExtractionSnippet: correlationExtractionSnippet,
      generatedUniqueId: 1,
    }

    expect(
      extractCorrelationBeginEndUrl(rule, request, 1, sequentialIdGenerator)
    ).toStrictEqual(expectedResult)
  })

  it('extract correlation regex body', () => {
    const sequentialIdGenerator = generateSequentialInt()
    const response: Response = generateResponse('noise<hello>bob<world>blah')

    const rule: CorrelationRuleRegex = {
      type: 'correlation',
      id: '1',
      extractor: {
        filter: { path: '' },
        selector: {
          type: 'regex',
          from: 'body',
          regex: 'hello>(.*?)<world>',
        },
      },
    }

    const correlationExtractionSnippet = `
    regex = new RegExp('${rule.extractor.selector.regex}')
    match = resp.body.match(regex)
    let correl_1
    if (match) {
      correl_1 = match[1]
    }`
    const expectedResult = {
      extractedValue: 'bob',
      correlationExtractionSnippet: correlationExtractionSnippet,
      generatedUniqueId: 1,
    }

    expect(
      extractCorrelationRegexBody(rule, response, 1, sequentialIdGenerator)
    ).toStrictEqual(expectedResult)
  })

  it('extract correlation regex header', () => {
    const sequentialIdGenerator = generateSequentialInt()
    const response: Response = generateResponse('')

    const rule: CorrelationRuleRegex = {
      type: 'correlation',
      id: '1',
      extractor: {
        filter: { path: '' },
        selector: {
          type: 'regex',
          from: 'headers',
          regex: 'application(.*?)json',
        },
      },
    }

    const correlationExtractionSnippet = `
    regex = new RegExp('${rule.extractor.selector.regex}')
    match = resp.headers["${canonicalHeaderKey('Content-type')}"].match(regex)
    let correl_1
    if (match) {
      correl_1 = match[1]
    }`
    const expectedResult = {
      extractedValue: '/',
      correlationExtractionSnippet: correlationExtractionSnippet,
      generatedUniqueId: 1,
    }

    expect(
      extractCorrelationRegexHeaders(rule, response, 1, sequentialIdGenerator)
    ).toStrictEqual(expectedResult)
  })

  it('extract correlation regex url', () => {
    const sequentialIdGenerator = generateSequentialInt()
    const request: Request = generateRequest()

    const rule: CorrelationRuleRegex = {
      type: 'correlation',
      id: '1',
      extractor: {
        filter: { path: '' },
        selector: {
          type: 'regex',
          from: 'url',
          regex: 'api/(.*?)/foo',
        },
      },
    }

    const correlationExtractionSnippet = `
    regex = new RegExp('${rule.extractor.selector.regex}')
    match = resp.url.match(regex)
    let correl_1
    if (match) {
      correl_1 = match[1]
    }`
    const expectedResult = {
      extractedValue: 'v1',
      correlationExtractionSnippet: correlationExtractionSnippet,
      generatedUniqueId: 1,
    }

    expect(
      extractCorrelationRegexUrl(rule, request, 1, sequentialIdGenerator)
    ).toStrictEqual(expectedResult)
  })
}
