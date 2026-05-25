import { describe, expect, it } from 'vitest'

import { validateExternalUrl } from './url'

describe('validateExternalUrl', () => {
  it('allows https URLs', () => {
    expect(validateExternalUrl('https://example.com')).toBe(
      'https://example.com'
    )
  })

  it('allows http URLs', () => {
    expect(validateExternalUrl('http://example.com')).toBe('http://example.com')
  })

  it('blocks javascript: protocol', () => {
    expect(() => validateExternalUrl('javascript:alert(1)')).toThrow(
      'Blocked URL with disallowed protocol: javascript:'
    )
  })

  it('blocks file: protocol', () => {
    expect(() => validateExternalUrl('file:///etc/passwd')).toThrow(
      'Blocked URL with disallowed protocol: file:'
    )
  })

  it('blocks data: protocol', () => {
    expect(() => validateExternalUrl('data:text/html,<h1>hi</h1>')).toThrow(
      'Blocked URL with disallowed protocol: data:'
    )
  })

  it('blocks vbscript: protocol', () => {
    expect(() => validateExternalUrl('vbscript:msgbox')).toThrow(
      'Blocked URL with disallowed protocol: vbscript:'
    )
  })

  it('throws on empty string', () => {
    expect(() => validateExternalUrl('')).toThrow()
  })

  it('throws on malformed URL', () => {
    expect(() => validateExternalUrl('not-a-url')).toThrow()
  })
})
