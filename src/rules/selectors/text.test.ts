import { describe, expect, it } from 'vitest'

import { createRequest } from '@/test/factories/proxyData'
import { TextSelector } from '@/types/rules'

import { replaceText } from './text'

describe('replaceText', () => {
  it('replaces text matches in URL', () => {
    const request = createRequest({
      url: 'http://test.k6.io/api/v1/foo',
      path: '/api/v1/foo',
    })

    const selectorMatch: TextSelector = {
      type: 'text',
      from: 'url',
      value: 'foo',
    }

    const selectorNotMatch: TextSelector = {
      type: 'text',
      from: 'url',
      value: 'not-existing',
    }

    expect(replaceText(request, selectorMatch, 'TEST_VALUE')?.url).toEqual(
      'http://test.k6.io/api/v1/TEST_VALUE'
    )
    expect(replaceText(request, selectorMatch, 'TEST_VALUE')?.path).toEqual(
      '/api/v1/TEST_VALUE'
    )

    expect(replaceText(request, selectorNotMatch, 'TEST_VALUE')).toBeUndefined()
  })

  it('replaces text matches in body', () => {
    const request = createRequest({
      content: 'foo bar baz',
    })

    const selectorMatch: TextSelector = {
      type: 'text',
      from: 'body',
      value: 'bar',
    }

    const selectorNotMatch: TextSelector = {
      type: 'text',
      from: 'body',
      value: 'not-existing',
    }

    expect(replaceText(request, selectorMatch, 'TEST_VALUE')?.content).toEqual(
      'foo TEST_VALUE baz'
    )

    expect(replaceText(request, selectorNotMatch, 'TEST_VALUE')).toBeUndefined()
  })

  it('replaces text matches in headers', () => {
    const request = createRequest({
      headers: [['content-type', 'application/json']],
    })

    const selectorMatch: TextSelector = {
      type: 'text',
      from: 'headers',
      value: 'application/json',
    }

    const selectorNotMatch: TextSelector = {
      type: 'text',
      from: 'headers',
      value: 'not-existing',
    }

    expect(replaceText(request, selectorMatch, 'TEST_VALUE')?.headers).toEqual([
      ['content-type', 'TEST_VALUE'],
    ])

    expect(replaceText(request, selectorNotMatch, 'TEST_VALUE')).toBeUndefined()
  })
})
