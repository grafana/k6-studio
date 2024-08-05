import { get } from 'lodash-es'
import { safeJsonParse } from '@/utils/json'
import { Header, Request, Cookie } from '@/types'
import { BeginEndSelector } from '@/types/rules'

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

export const getJsonObjectFromPath = (value: string, path: string) => {
  return get(safeJsonParse(value), path)
}

export const replaceContent = (request: Request, value: string, variableName: string) => {
  return request.content?.replaceAll(value, `\${${variableName}}`) ?? null
}

export const replaceUrl = (request: Request, value: string, variableName: string) => {
  return request.url.replaceAll(value, `\${${variableName}}`)
}

export const replaceHeaders = (request: Request, value: string, variableName: string) => {
  const headers: Header[] = request.headers.map(([key, headerValue]) => {
    const replacedValue = headerValue.replaceAll(
      value,
      `\${${variableName}}`
    )
    return [key, replacedValue]
  })
  return headers
}

export const replaceCookies = (request: Request, value: string, variableName: string) => {
  const cookies: Cookie[] = request.cookies.map(([key, cookieValue]) => {
    const replacedValue = cookieValue.replaceAll(
      value,
      `\${${variableName}}`
    )
    return [key, replacedValue]
  })

  return cookies
}

export const replaceBeginEndBody = (selector: BeginEndSelector, request: Request, variableName: string) => {
  const valueToReplace = matchBeginEnd(request.content ?? '', selector.begin, selector.end)
  if (!valueToReplace) return request

  const content = replaceContent(request, valueToReplace, variableName)
  return { ...request, content }
}

export const replaceBeginEndHeaders = (selector: BeginEndSelector, request: Request, variableName: string) => {
  for (const [, value] of request.headers) {
    const valueToReplace = matchBeginEnd(
      value,
      selector.begin,
      selector.end
    )
    if (valueToReplace) {
      const headers = replaceHeaders(request, valueToReplace, variableName)
      return { ...request, headers }
    }
  }

  return request
}

export const replaceBeginEndUrl = (selector: BeginEndSelector, request: Request, variableName: string) => {
  const valueToReplace = matchBeginEnd(request.url, selector.begin, selector.end)
  if (!valueToReplace) return request

  const url = replaceUrl(request, valueToReplace, variableName)
  return { ...request, url }
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
  })

  it('match regex', () => {
    expect(matchRegex('<div>cat</div>', '<div>(.*?)</div>')).toBe('cat')
    expect(matchRegex('jumpinginthelake', 'ing(.*?)the')).toBe('in')
    expect(matchRegex('hello', '<a>(.*?)</a>')).toBeUndefined()
  })

  it('get json object', () => {
    expect(getJsonObjectFromPath('{"hello":"world"}', 'hello')).toBe('world')
    expect(getJsonObjectFromPath('{"hello":"world"}', 'world')).toBeUndefined()
    expect(getJsonObjectFromPath('[{"hello":"world"}]', '[0].hello')).toBe(
      'world'
    )
    expect(getJsonObjectFromPath('hello', '[0]')).toBeUndefined()
  })

  it('replace content', () => {
    const request = generateRequest('<div>hello</div>')
    expect(replaceContent(request, 'hello', 'correl_0')).toBe('<div>${correl_0}</div>')
    expect(replaceContent(request, 'world', 'correl_0')).toBe('<div>hello</div>')
  })

  it('replace headers', () => {
    const request = generateRequest('')
    expect(replaceHeaders(request, 'application', 'correl_0')[0]).toStrictEqual(['content-type', '${correl_0}/json'])
    expect(replaceHeaders(request, 'protobuf', 'correl_0')[0]).toStrictEqual(['content-type', 'application/json'])
  })

  it('replace url', () => {
    const request = generateRequest('')
    expect(replaceUrl(request, 'api', 'correl_0')).toBe('http://test.k6.io/${correl_0}/v1/foo')
    expect(replaceUrl(request, 'jumanji', 'correl_0')).toBe('http://test.k6.io/api/v1/foo')
  })

  it('replace cookies', () => {
    const request = generateRequest('')
    expect(replaceCookies(request, 'on', 'correl_0')[0]).toStrictEqual(['security', 'n${correl_0}e'])
    expect(replaceCookies(request, 'notincookie', 'correl_0')[0]).toStrictEqual(['security', 'none'])
  })

  it('replace begin end body', () => {
    const selector: BeginEndSelector = {
      type: 'begin-end',
      from: 'body',
      begin: '<div>',
      end: '</div>'
    }
    expect(replaceBeginEndBody(selector, generateRequest('<div>hello</div>'), 'correl_0').content).toBe('<div>${correl_0}</div>')
    expect(replaceBeginEndBody(selector, generateRequest('<a>hello</a>'), 'correl_0').content).toBe('<a>hello</a>')
  })

  it('replace begin end headers', () => {
    const request = generateRequest('')
    const selectorMatch: BeginEndSelector = {
      type: 'begin-end',
      from: 'body',
      begin: 'application',
      end: 'json'
    }
    const selectorNotMatch: BeginEndSelector = {
      type: 'begin-end',
      from: 'body',
      begin: 'hello',
      end: 'world'
    }
    expect(replaceBeginEndHeaders(selectorMatch, request, 'correl_0').headers[0]).toStrictEqual(['content-type', 'application${correl_0}json'])
    expect(replaceBeginEndHeaders(selectorNotMatch, request, 'correl_0').headers[0]).toStrictEqual(['content-type', 'application/json'])
  })

  it('replace begin end url', () => {
    const request = generateRequest('')
    const selectorMatch: BeginEndSelector = {
      type: 'begin-end',
      from: 'url',
      begin: '.io/',
      end: '/v1'
    }
    const selectorNotMatch: BeginEndSelector = {
      type: 'begin-end',
      from: 'url',
      begin: 'supercali',
      end: 'fragilisti'
    }
    expect(replaceBeginEndUrl(selectorMatch, request, 'correl_0').url).toBe('http://test.k6.io/${correl_0}/v1/foo')
    expect(replaceBeginEndUrl(selectorNotMatch, request, 'correl_0').url).toBe('http://test.k6.io/api/v1/foo')
  })
}
