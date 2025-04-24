import { escapeRegExp, get, set } from 'lodash-es'

import { Header, Request, Cookie } from '@/types'
import {
  BeginEndSelector,
  HeaderNameSelector,
  JsonSelector,
  RegexSelector,
  ReplacerSelector,
} from '@/types/rules'
import { safeJsonParse } from '@/utils/json'
import { exhaustive } from '@/utils/typescript'

import { replaceText } from './selectors/text'
import { canonicalHeaderKey, isJsonReqResp } from './utils'

export function replaceRequestValues({
  selector,
  value,
  request,
}: {
  selector: ReplacerSelector
  request: Request
  value: string
}): Request | undefined {
  switch (selector.type) {
    case 'begin-end':
      return replaceBeginEnd(selector, request, value)
    case 'regex':
      return replaceRegex(selector, request, value)
    case 'json':
      return replaceJsonBody(selector, request, value)
    case 'header-name':
      return replaceHeaderByName(request, selector, value)
    case 'text':
      return replaceText(request, selector, value)
    default:
      return exhaustive(selector)
  }
}

const replaceBeginEnd = (
  selector: BeginEndSelector,
  request: Request,
  variableName: string
) => {
  switch (selector.from) {
    case 'body':
      return replaceBeginEndBody(selector, request, variableName)
    case 'headers':
      return replaceBeginEndHeaders(selector, request, variableName)
    case 'url':
      return replaceBeginEndUrl(selector, request, variableName)
    default:
      return exhaustive(selector.from)
  }
}

const replaceRegex = (
  selector: RegexSelector,
  request: Request,
  variableName: string
) => {
  switch (selector.from) {
    case 'body':
      return replaceRegexBody(selector, request, variableName)
    case 'headers':
      return replaceRegexHeaders(selector, request, variableName)
    case 'url':
      return replaceRegexUrl(selector, request, variableName)
    default:
      return exhaustive(selector.from)
  }
}

export const matchBeginEnd = (value: string, begin: string, end: string) => {
  // matches only the first occurrence
  const regex = new RegExp(`${escapeRegExp(begin)}(.*?)${escapeRegExp(end)}`)
  const match = value.match(regex)
  if (match) {
    return match[1]
  }
}

export const matchRegex = (value: string, regexString: string) => {
  // matches only the first occurrence
  const regex = new RegExp(regexString)
  const match = value.match(regex)
  if (match) {
    return match[1]
  }
}

export const getJsonObjectFromPath = (json: string, path: string) => {
  // TODO: https://github.com/grafana/k6-studio/issues/277
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return get(safeJsonParse(json), path)
}

export const setJsonObjectFromPath = (
  json: string,
  path: string,
  value: string
) => {
  const jsonObject = safeJsonParse(json)
  set(jsonObject ?? {}, path, value)
  return JSON.stringify(jsonObject)
}

export const replaceContent = (
  content: string | null,
  value: string,
  newValue: string
) => {
  return content?.replaceAll(value, newValue) ?? null
}

export const replaceUrl = (url: string, value: string, newValue: string) => {
  return url.replaceAll(value, newValue)
}

export const replaceHeaders = (
  headers: Header[],
  value: string,
  newValue: string
): Header[] => {
  return headers.map(([key, headerValue]) => {
    const replacedValue = headerValue.replaceAll(value, newValue)
    return [key, replacedValue]
  })
}

export const replaceCookies = (
  cookies: Cookie[],
  value: string,
  newValue: string
): Cookie[] => {
  return cookies.map(([key, cookieValue]) => {
    const replacedValue = cookieValue.replaceAll(value, newValue)
    return [key, replacedValue]
  })
}

export const replaceBeginEndBody = (
  selector: BeginEndSelector,
  request: Request,
  variableName: string
) => {
  const valueToReplace = matchBeginEnd(
    request.content ?? '',
    selector.begin,
    selector.end
  )
  if (!valueToReplace) return

  const content = replaceContent(request.content, valueToReplace, variableName)
  return { ...request, content }
}

export const replaceBeginEndHeaders = (
  selector: BeginEndSelector,
  request: Request,
  variableName: string
) => {
  for (const [, value] of request.headers) {
    const valueToReplace = matchBeginEnd(value, selector.begin, selector.end)
    if (valueToReplace) {
      const headers = replaceHeaders(
        request.headers,
        valueToReplace,
        variableName
      )
      return { ...request, headers }
    }
  }

  return
}

export const replaceBeginEndUrl = (
  selector: BeginEndSelector,
  request: Request,
  variableName: string
) => {
  const valueToReplace = matchBeginEnd(
    request.url,
    selector.begin,
    selector.end
  )
  if (!valueToReplace) return

  const url = replaceUrl(request.url, valueToReplace, variableName)
  const path = replaceUrl(request.path, valueToReplace, variableName)
  const host = replaceUrl(request.host, valueToReplace, variableName)
  return { ...request, url, path, host }
}

export const replaceRegexBody = (
  selector: RegexSelector,
  request: Request,
  variableName: string
) => {
  const valueToReplace = matchRegex(request.content ?? '', selector.regex)
  if (!valueToReplace) return

  const content = replaceContent(request.content, valueToReplace, variableName)
  return { ...request, content }
}

export const replaceRegexHeaders = (
  selector: RegexSelector,
  request: Request,
  variableName: string
) => {
  for (const [, value] of request.headers) {
    const valueToReplace = matchRegex(value, selector.regex)
    if (valueToReplace) {
      const headers = replaceHeaders(
        request.headers,
        valueToReplace,
        variableName
      )
      return { ...request, headers }
    }
  }

  return
}

export const replaceRegexUrl = (
  selector: RegexSelector,
  request: Request,
  variableName: string
) => {
  const valueToReplace = matchRegex(request.url, selector.regex)
  if (!valueToReplace) return

  const url = replaceUrl(request.url, valueToReplace, variableName)
  const path = replaceUrl(request.path, valueToReplace, variableName)
  const host = replaceUrl(request.host, valueToReplace, variableName)
  return { ...request, url, path, host }
}

export const replaceJsonBody = (
  selector: JsonSelector,
  request: Request,
  value: string
) => {
  if (!isJsonReqResp(request) || !request.content) {
    return
  }

  // since we are using lodash and its `set` function creates missing paths we will first check that the path really
  // exists before setting it
  // TODO: https://github.com/grafana/k6-studio/issues/277
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const valueToReplace = getJsonObjectFromPath(request.content, selector.path)
  if (valueToReplace === undefined) return

  const content = setJsonObjectFromPath(request.content, selector.path, value)
  return { ...request, content }
}

const replaceHeaderByName = (
  request: Request,
  selector: HeaderNameSelector,
  value: string
): Request | undefined => {
  const headerExists = request.headers.find(
    ([key]) => canonicalHeaderKey(key) === canonicalHeaderKey(selector.name)
  )

  if (!headerExists) {
    return
  }

  const replacedHeaders = request.headers.map(
    ([key, originalValue]): Header =>
      canonicalHeaderKey(key) === canonicalHeaderKey(selector.name)
        ? [key, value]
        : [key, originalValue]
  )

  return { ...request, headers: replacedHeaders }
}

// @ts-expect-error we have commonjs set as module option
if (import.meta.vitest) {
  // @ts-expect-error we have commonjs set as module option
  const { it, expect } = import.meta.vitest

  const generateRequest = (content: string | null): Request => {
    return {
      method: 'POST',
      url: 'http://test.k6.io/api/v1/foo',
      headers: [
        ['content-type', 'application/json'],
        ['content-length', '1000'],
      ],
      cookies: [['security', 'none']],
      query: [],
      scheme: 'http',
      host: 'localhost:3000',
      content,
      path: '/api/v1/foo',
      timestampStart: 0,
      timestampEnd: 0,
      contentLength: 0,
      httpVersion: '1.1',
    }
  }

  it('match begin end', () => {
    expect(matchBeginEnd('<div>cat</div>', '<div>', '</div>')).toBe('cat')
    expect(matchBeginEnd('jumpinginthelake', 'ing', 'the')).toBe('in')
    expect(matchBeginEnd('hello', '<a>', '</a>')).toBeUndefined()
    // matches only the first occurrence
    expect(
      matchBeginEnd('<div>cat</div><div>bob</div>', '<div>', '</div>')
    ).toBe('cat')
  })

  it('match regex', () => {
    expect(matchRegex('<div>cat</div>', '<div>(.*?)</div>')).toBe('cat')
    expect(matchRegex('jumpinginthelake', 'ing(.*?)the')).toBe('in')
    expect(matchRegex('hello', '<a>(.*?)</a>')).toBeUndefined()
    // matches only the first occurrence
    expect(matchRegex('<div>cat</div><div>bob</div>', '<div>(.*?)</div>')).toBe(
      'cat'
    )
  })

  it('get json object', () => {
    expect(getJsonObjectFromPath('{"hello":"world"}', 'hello')).toBe('world')
    expect(getJsonObjectFromPath('{"hello":"world"}', 'world')).toBeUndefined()
    expect(getJsonObjectFromPath('[{"hello":"world"}]', '[0].hello')).toBe(
      'world'
    )
    expect(getJsonObjectFromPath('hello', '[0]')).toBeUndefined()
  })

  it('set json object', () => {
    expect(setJsonObjectFromPath('{"hello":"world"}', 'hello', 'ciao')).toBe(
      '{"hello":"ciao"}'
    )
    expect(
      setJsonObjectFromPath('[{"hello":"world"}]', '[0].hello', 'ciao')
    ).toBe('[{"hello":"ciao"}]')
    expect(getJsonObjectFromPath('hello', '[0]')).toBeUndefined()
  })

  it('replace content', () => {
    const request = generateRequest('<div>hello</div>')
    expect(replaceContent(request.content, 'hello', '${correl_0}')).toBe(
      '<div>${correl_0}</div>'
    )
    expect(replaceContent(request.content, 'world', 'correl_0')).toBe(
      '<div>hello</div>'
    )
  })

  it('replace headers', () => {
    const request = generateRequest('')
    expect(
      replaceHeaders(request.headers, 'application', '${correl_0}')[0]
    ).toStrictEqual(['content-type', '${correl_0}/json'])
    expect(
      replaceHeaders(request.headers, 'protobuf', '${correl_0}')[0]
    ).toStrictEqual(['content-type', 'application/json'])
  })

  it('replace url', () => {
    const request = generateRequest('')
    expect(replaceUrl(request.url, 'api', '${correl_0}')).toBe(
      'http://test.k6.io/${correl_0}/v1/foo'
    )
    expect(replaceUrl(request.url, 'jumanji', 'correl_0')).toBe(
      'http://test.k6.io/api/v1/foo'
    )
  })

  it('replace cookies', () => {
    const request = generateRequest('')
    expect(
      replaceCookies(request.cookies, 'on', '${correl_0}')[0]
    ).toStrictEqual(['security', 'n${correl_0}e'])
    expect(
      replaceCookies(request.cookies, 'notincookie', 'correl_0')[0]
    ).toStrictEqual(['security', 'none'])
  })

  it('replace begin end body', () => {
    const selector: BeginEndSelector = {
      type: 'begin-end',
      from: 'body',
      begin: '<div>',
      end: '</div>',
    }
    expect(
      replaceBeginEndBody(
        selector,
        generateRequest('<div>hello</div>'),
        '${correl_0}'
      )?.content
    ).toBe('<div>${correl_0}</div>')
    expect(
      replaceBeginEndBody(selector, generateRequest('<a>hello</a>'), 'correl_0')
    ).toBeUndefined()
  })

  it('replace begin end headers', () => {
    const request = generateRequest('')
    const selectorMatch: BeginEndSelector = {
      type: 'begin-end',
      from: 'headers',
      begin: 'application',
      end: 'json',
    }
    const selectorNotMatch: BeginEndSelector = {
      type: 'begin-end',
      from: 'headers',
      begin: 'hello',
      end: 'world',
    }
    expect(
      replaceBeginEndHeaders(selectorMatch, request, '${correl_0}')?.headers[0]
    ).toStrictEqual(['content-type', 'application${correl_0}json'])
    expect(
      replaceBeginEndHeaders(selectorNotMatch, request, 'correl_0')
    ).toBeUndefined()
  })

  it('replace begin end url', () => {
    const request = generateRequest('')
    const selectorMatch: BeginEndSelector = {
      type: 'begin-end',
      from: 'url',
      begin: '.io/',
      end: '/v1',
    }
    const selectorNotMatch: BeginEndSelector = {
      type: 'begin-end',
      from: 'url',
      begin: 'supercali',
      end: 'fragilisti',
    }
    const match = replaceBeginEndUrl(selectorMatch, request, '${correl_0}')

    expect(match?.url).toBe('http://test.k6.io/${correl_0}/v1/foo')
    expect(match?.path).toBe('/${correl_0}/v1/foo')

    expect(
      replaceBeginEndUrl(selectorNotMatch, request, 'correl_0')
    ).toBeUndefined()
  })

  it('replace regex body', () => {
    const selector: RegexSelector = {
      type: 'regex',
      from: 'body',
      regex: '<div>(.*?)</div>',
    }
    expect(
      replaceRegexBody(
        selector,
        generateRequest('<div>hello</div>'),
        '${correl_0}'
      )?.content
    ).toBe('<div>${correl_0}</div>')
    expect(
      replaceRegexBody(selector, generateRequest('<a>hello</a>'), 'correl_0')
    ).toBeUndefined()
  })

  it('replace regex headers', () => {
    const request = generateRequest('')
    const selectorMatch: RegexSelector = {
      type: 'regex',
      from: 'headers',
      regex: 'application(.*?)json',
    }
    const selectorNotMatch: RegexSelector = {
      type: 'regex',
      from: 'headers',
      regex: 'hello(.*?)world',
    }
    expect(
      replaceRegexHeaders(selectorMatch, request, '${correl_0}')?.headers[0]
    ).toStrictEqual(['content-type', 'application${correl_0}json'])
    expect(
      replaceRegexHeaders(selectorNotMatch, request, 'correl_0')
    ).toBeUndefined()
  })

  it('replace regex url', () => {
    const request = generateRequest('')
    const selectorMatch: RegexSelector = {
      type: 'regex',
      from: 'url',
      regex: '.io/(.*?)/v1',
    }
    const selectorNotMatch: RegexSelector = {
      type: 'regex',
      from: 'url',
      regex: 'supercali(.*?)fragilisti',
    }
    expect(replaceRegexUrl(selectorMatch, request, '${correl_0}')?.url).toBe(
      'http://test.k6.io/${correl_0}/v1/foo'
    )
    expect(
      replaceRegexUrl(selectorNotMatch, request, 'correl_0')
    ).toBeUndefined()
  })

  it('replace json body', () => {
    const selectorMatch: JsonSelector = {
      type: 'json',
      from: 'body',
      path: 'hello',
    }
    const selectorNotMatch: JsonSelector = {
      type: 'json',
      from: 'body',
      path: 'world',
    }
    const selectorMatchArray: JsonSelector = {
      type: 'json',
      from: 'body',
      path: '[0].hello',
    }

    expect(
      replaceJsonBody(
        selectorMatch,
        generateRequest('{"hello":"world"}'),
        '${correl_0}'
      )?.content
    ).toBe('{"hello":"${correl_0}"}')

    expect(
      replaceJsonBody(
        selectorNotMatch,
        generateRequest('{"hello":"world"}'),
        '${correl_0}'
      )
    ).toBeUndefined()

    expect(
      replaceJsonBody(
        selectorMatchArray,
        generateRequest('[{"hello":"world"}]'),
        '${correl_0}'
      )?.content
    ).toBe('[{"hello":"${correl_0}"}]')

    // Empty string replacement
    expect(
      replaceJsonBody(
        selectorMatchArray,
        generateRequest('[{"hello":""}]'),
        '${correl_0}'
      )?.content
    ).toBe('[{"hello":"${correl_0}"}]')

    // Boolean replacement
    expect(
      replaceJsonBody(
        selectorMatchArray,
        generateRequest('[{"hello":false}]'),
        '${correl_0}'
      )?.content
    ).toBe('[{"hello":"${correl_0}"}]')
  })

  it('replaces header name matches', () => {
    const request = generateRequest('')

    const selectorMatch: HeaderNameSelector = {
      type: 'header-name',
      from: 'headers',
      name: 'Content-Type',
    }

    const selectorNotMatch: HeaderNameSelector = {
      type: 'header-name',
      from: 'headers',
      name: 'not-existing',
    }

    expect(
      replaceHeaderByName(request, selectorMatch, 'TEST_VALUE')?.headers
    ).toEqual([
      ['content-type', 'TEST_VALUE'],
      ['content-length', '1000'],
    ])

    expect(
      replaceHeaderByName(request, selectorNotMatch, 'TEST_VALUE')
    ).toBeUndefined()
  })
}
