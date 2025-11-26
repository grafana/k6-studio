import { describe, expect, it } from 'vitest'

import { containsBinaryData, isBase64, safeAtob, safeBtoa } from './format'

describe('containsBinaryData', () => {
  it('should detect null bytes as binary data', () => {
    const str = 'hello\0world'
    expect(containsBinaryData(str)).toBe(true)
  })

  it('should detect control characters as binary data', () => {
    // Control character 0x01 (SOH - Start of Heading)
    const str = 'hello\x01world'
    expect(containsBinaryData(str)).toBe(true)
  })

  it('should detect replacement character as binary data', () => {
    const str = 'hello\uFFFDworld'
    expect(containsBinaryData(str)).toBe(true)
  })

  it('should allow common text control characters', () => {
    // Tab, newline, carriage return should be allowed
    const str = 'hello\t\n\rworld'
    expect(containsBinaryData(str)).toBe(false)
  })

  it('should return false for plain text', () => {
    const str = 'This is plain text with numbers 123 and symbols !@#$%'
    expect(containsBinaryData(str)).toBe(false)
  })

  it('should return false for JSON strings', () => {
    const str = '{"key": "value", "number": 123}'
    expect(containsBinaryData(str)).toBe(false)
  })

  it('should return false for multipart form data without binary', () => {
    const str =
      '------WebKitFormBoundary\r\nContent-Disposition: form-data; name="field"\r\n\r\nvalue\r\n------WebKitFormBoundary--'
    expect(containsBinaryData(str)).toBe(false)
  })

  it('should detect binary image data', () => {
    // JPEG header bytes
    const binaryData = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])
    const str = String.fromCharCode(...binaryData)
    expect(containsBinaryData(str)).toBe(true)
  })

  it('should detect PDF binary data', () => {
    // PDF with binary content
    const binaryData = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x00, 0x01])
    const str = String.fromCharCode(...binaryData)
    expect(containsBinaryData(str)).toBe(true)
  })
})

describe('isBase64', () => {
  it('should return true for valid base64 strings', () => {
    expect(isBase64('SGVsbG8gV29ybGQ=')).toBe(true)
  })

  it('should return false for invalid base64 strings', () => {
    expect(isBase64('This is not base64!')).toBe(false)
  })
})

describe('safeAtob', () => {
  it('should decode valid base64', () => {
    expect(safeAtob('SGVsbG8gV29ybGQ=')).toBe('Hello World')
  })

  it('should return original string on decode error', () => {
    const invalidBase64 = 'not base64!'
    expect(safeAtob(invalidBase64)).toBe(invalidBase64)
  })
})

describe('safeBtoa', () => {
  it('should encode string to base64', () => {
    expect(safeBtoa('Hello World')).toBe('SGVsbG8gV29ybGQ=')
  })

  it('should handle strings with characters outside Latin-1 range', () => {
    // String with invalid characters for standard btoa
    const str = 'Hello \uFFFD' // Replacement character
    const encoded = safeBtoa(str)
    // Should successfully encode using UTF-8 method
    expect(encoded).toBeTruthy()
    expect(encoded).toMatch(/^[A-Za-z0-9+/=]+$/) // Valid base64
  })

  it('should handle binary strings', () => {
    // Binary data that would fail standard btoa
    const binaryData = new Uint8Array([0xff, 0xd8, 0xff, 0xe0])
    const binaryStr = String.fromCharCode(...binaryData)
    const encoded = safeBtoa(binaryStr)
    // Should successfully encode
    expect(encoded).toBeTruthy()
    expect(encoded).toMatch(/^[A-Za-z0-9+/=]+$/)
  })
})
