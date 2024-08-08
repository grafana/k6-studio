import { get, set } from 'lodash-es'
import { safeJsonParse } from '@/utils/json'
import { Header, Request, Cookie } from '@/types'
import { BeginEndSelector, JsonSelector, RegexSelector } from '@/types/rules'
import { isJsonReqResp } from './utils'

export const matchBeginEnd = (value: string, begin: string, end: string) => {
  // matches only the first occurrence
  const regex = new RegExp(`${begin}(.*?)${end}`)
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
  return get(safeJsonParse(json), path)
}

export const setJsonObjectFromPath = (
  json: string,
  path: string,
  value: string
) => {
  const jsonObject = safeJsonParse(json)
  set(jsonObject, path, value)
  return JSON.stringify(jsonObject)
}

export const replaceContent = (
  content: string | null,
  value: string,
  variableName: string
) => {
  return content?.replaceAll(value, `\${${variableName}}`) ?? null
}

export const replaceUrl = (
  url: string,
  value: string,
  variableName: string
) => {
  return url.replaceAll(value, `\${${variableName}}`)
}

export const replaceHeaders = (
  headers: Header[],
  value: string,
  variableName: string
): Header[] => {
  return headers.map(([key, headerValue]) => {
    const replacedValue = headerValue.replaceAll(value, `\${${variableName}}`)
    return [key, replacedValue]
  })
}

export const replaceCookies = (
  cookies: Cookie[],
  value: string,
  variableName: string
): Cookie[] => {
  return cookies.map(([key, cookieValue]) => {
    const replacedValue = cookieValue.replaceAll(value, `\${${variableName}}`)
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
  if (!valueToReplace) return request

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

  return request
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
  if (!valueToReplace) return request

  const url = replaceUrl(request.url, valueToReplace, variableName)
  return { ...request, url }
}

export const replaceRegexBody = (
  selector: RegexSelector,
  request: Request,
  variableName: string
) => {
  const valueToReplace = matchRegex(request.content ?? '', selector.regex)
  if (!valueToReplace) return request

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

  return request
}

export const replaceRegexUrl = (
  selector: RegexSelector,
  request: Request,
  variableName: string
) => {
  const valueToReplace = matchRegex(request.url, selector.regex)
  if (!valueToReplace) return request

  const url = replaceUrl(request.url, valueToReplace, variableName)
  return { ...request, url }
}

export const replaceJsonBody = (
  selector: JsonSelector,
  request: Request,
  variableName: string
) => {
  if (!isJsonReqResp(request) || !request.content) {
    return request
  }

  // since we are using lodash and its `set` function creates missing paths we will first check that the path really
  // exists before setting it
  const valueToReplace = getJsonObjectFromPath(request.content, selector.path)
  if (!valueToReplace) return request

  const content = setJsonObjectFromPath(
    request.content,
    selector.path,
    `\${${variableName}}`
  )
  return { ...request, content }
}

// @ts-expect-error we have commonjs set as module option
if (import.meta.vitest) {
  // @ts-expect-error we have commonjs set as module option
  const { it, expect } = import.meta.vitest

  const generateRequest = (content: string | null): Request => {
    return {
      method: 'POST',
      url: 'http://test.k6.io/api/v1/foo',
      headers: [['content-type', 'application/json']],
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
    expect(replaceContent(request.content, 'hello', 'correl_0')).toBe(
      '<div>${correl_0}</div>'
    )
    expect(replaceContent(request.content, 'world', 'correl_0')).toBe(
      '<div>hello</div>'
    )
  })

  it('replace headers', () => {
    const request = generateRequest('')
    expect(
      replaceHeaders(request.headers, 'application', 'correl_0')[0]
    ).toStrictEqual(['content-type', '${correl_0}/json'])
    expect(
      replaceHeaders(request.headers, 'protobuf', 'correl_0')[0]
    ).toStrictEqual(['content-type', 'application/json'])
  })

  it('replace url', () => {
    const request = generateRequest('')
    expect(replaceUrl(request.url, 'api', 'correl_0')).toBe(
      'http://test.k6.io/${correl_0}/v1/foo'
    )
    expect(replaceUrl(request.url, 'jumanji', 'correl_0')).toBe(
      'http://test.k6.io/api/v1/foo'
    )
  })

  it('replace cookies', () => {
    const request = generateRequest('')
    expect(replaceCookies(request.cookies, 'on', 'correl_0')[0]).toStrictEqual([
      'security',
      'n${correl_0}e',
    ])
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
        'correl_0'
      ).content
    ).toBe('<div>${correl_0}</div>')
    expect(
      replaceBeginEndBody(selector, generateRequest('<a>hello</a>'), 'correl_0')
        .content
    ).toBe('<a>hello</a>')
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
      replaceBeginEndHeaders(selectorMatch, request, 'correl_0').headers[0]
    ).toStrictEqual(['content-type', 'application${correl_0}json'])
    expect(
      replaceBeginEndHeaders(selectorNotMatch, request, 'correl_0').headers[0]
    ).toStrictEqual(['content-type', 'application/json'])
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
    expect(replaceBeginEndUrl(selectorMatch, request, 'correl_0').url).toBe(
      'http://test.k6.io/${correl_0}/v1/foo'
    )
    expect(replaceBeginEndUrl(selectorNotMatch, request, 'correl_0').url).toBe(
      'http://test.k6.io/api/v1/foo'
    )
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
        'correl_0'
      ).content
    ).toBe('<div>${correl_0}</div>')
    expect(
      replaceRegexBody(selector, generateRequest('<a>hello</a>'), 'correl_0')
        .content
    ).toBe('<a>hello</a>')
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
      replaceRegexHeaders(selectorMatch, request, 'correl_0').headers[0]
    ).toStrictEqual(['content-type', 'application${correl_0}json'])
    expect(
      replaceRegexHeaders(selectorNotMatch, request, 'correl_0').headers[0]
    ).toStrictEqual(['content-type', 'application/json'])
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
    expect(replaceRegexUrl(selectorMatch, request, 'correl_0').url).toBe(
      'http://test.k6.io/${correl_0}/v1/foo'
    )
    expect(replaceRegexUrl(selectorNotMatch, request, 'correl_0').url).toBe(
      'http://test.k6.io/api/v1/foo'
    )
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
        'correl_0'
      ).content
    ).toBe('{"hello":"${correl_0}"}')
    expect(
      replaceJsonBody(
        selectorNotMatch,
        generateRequest('{"hello":"world"}'),
        'correl_0'
      ).content
    ).toBe('{"hello":"world"}')
    expect(
      replaceJsonBody(
        selectorMatchArray,
        generateRequest('[{"hello":"world"}]'),
        'correl_0'
      ).content
    ).toBe('[{"hello":"${correl_0}"}]')
  })
}
