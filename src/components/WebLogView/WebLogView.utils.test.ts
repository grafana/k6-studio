import { describe, expect, it } from 'vitest'

import {
  removeHostFromUrl,
  removeProtocolFromUrl,
  removeQueryStringFromUrl,
} from './WebLogView.utils'

describe('WebLogView.utils', () => {
  it('should remove the host from the URL', () => {
    const url = 'example.com/path/to/resource'
    expect(removeHostFromUrl(url)).toBe('path/to/resource')
  })

  it('should remove the protocol from the URL', () => {
    const url = 'https://example.com/path/to/resource'
    expect(removeProtocolFromUrl(url)).toBe('example.com/path/to/resource')
  })

  it('should remove the query string from the URL', () => {
    const url = 'https://example.com/path/to/resource?query=string'
    expect(removeQueryStringFromUrl(url)).toBe(
      'https://example.com/path/to/resource'
    )
  })
})
