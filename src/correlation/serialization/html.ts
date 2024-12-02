import { RawBody, HtmlBody } from '../model/types'

export const tryDeserialize = (raw: RawBody): HtmlBody | RawBody => {
  const parser = new DOMParser()
  const document = parser.parseFromString(raw.text, 'text/html')

  if (document.documentElement.tagName === 'parsererror') {
    return raw
  }

  return {
    type: 'html',
    document,
  }
}

export const serialize = (document: Document): RawBody => ({
  type: 'raw',
  mimeType: 'text/html',
  text: document.documentElement.innerHTML,
})
