export function queryStringToJSON(str: string) {
  // TODO: https://github.com/grafana/k6-studio/issues/277
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return JSON.parse(
    '{"' + str.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
    function (key, value) {
      // TODO: https://github.com/grafana/k6-studio/issues/277
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
      return key === '' ? value : decodeURIComponent(value)
    }
  )
}

export function safeAtob(content: string) {
  try {
    return atobUTF8(content)
  } catch {
    return content
  }
}

// Decode base64 preserving UTF-8, like arabic characters
function atobUTF8(base64Str: string) {
  // decode base64 to binary
  const binaryStr = atob(base64Str)

  // convert binary string to bytes
  const bytes = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i)
  }

  // decode bytes as UTF-8
  return new TextDecoder('utf-8').decode(bytes)
}

export function safeBtoa(content: string) {
  try {
    return btoa(content)
  } catch {
    // btoa fails for strings with characters outside Latin-1 range
    // Convert to UTF-8 bytes then to base64
    return btoaUTF8(content)
  }
}

// Encode UTF-8 string to base64, handling binary data safely
function btoaUTF8(str: string) {
  try {
    // Convert string to bytes
    const bytes = new TextEncoder().encode(str)

    // Convert bytes to binary string
    let binaryString = ''
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i]
      if (byte !== undefined) {
        binaryString += String.fromCharCode(byte)
      }
    }

    // Encode to base64
    return btoa(binaryString)
  } catch {
    // Last resort: try direct btoa on the original string
    try {
      return btoa(str)
    } catch {
      // If all else fails, return empty string as we can't encode this
      console.error('Failed to encode string to base64')
      return ''
    }
  }
}

export function stringify(
  obj: Parameters<JSON['stringify']>[0],
  space: number = 2
) {
  return JSON.stringify(obj, null, space)
}

export function isBase64(str: string) {
  try {
    return btoa(atob(str)) === str
  } catch {
    return false
  }
}

/**
 * Check if a string contains binary data that cannot be safely embedded in a JS string literal
 * Returns true if the string contains null bytes or other control characters that indicate binary data
 */
export function containsBinaryData(str: string): boolean {
  // Check for null bytes - definite indicator of binary data
  if (str.includes('\0')) {
    return true
  }

  // Check for other control characters that typically indicate binary data
  // Exclude common text control chars like \n, \r, \t
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i)
    // Control characters except tab, newline, carriage return
    if (code < 32 && code !== 9 && code !== 10 && code !== 13) {
      return true
    }
    // Check for replacement character which indicates invalid UTF-8
    if (code === 0xfffd) {
      return true
    }
  }

  return false
}
