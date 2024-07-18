export function formDataToJSON(str: string) {
  const result = queryStringToJSON(str)

  return queryStringToJSON(result.body)
}

export function queryStringToJSON(str: string) {
  return JSON.parse(
    '{"' + str.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
    function (key, value) {
      return key === '' ? value : decodeURIComponent(value)
    }
  )
}

export function stringify(obj: object) {
  return JSON.stringify(obj, null, 2)
}
