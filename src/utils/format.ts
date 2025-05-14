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
    return content
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
