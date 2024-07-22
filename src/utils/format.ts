export function queryStringToJSON(str: string) {
  return JSON.parse(
    '{"' + str.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
    function (key, value) {
      return key === '' ? value : decodeURIComponent(value)
    }
  )
}

export function safeAtob(content: string) {
  try {
    return atob(content)
  } catch {
    return content
  }
}

export function safeBtoa(content: string) {
  try {
    return btoa(content)
  } catch {
    return content
  }
}

export function stringify(obj: object) {
  return JSON.stringify(obj, null, 2)
}

export function isBase64(str: string) {
  try {
    return btoa(atob(str)) === str
  } catch {
    return false
  }
}
