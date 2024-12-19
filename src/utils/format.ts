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

export function stringify(obj: object, space: number = 2) {
  return JSON.stringify(obj, null, space)
}

export function isBase64(str: string) {
  try {
    return btoa(atob(str)) === str
  } catch {
    return false
  }
}
