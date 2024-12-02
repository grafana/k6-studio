import { Body, RawBody } from '../model/types'

import * as html from '../serialization/html'
import * as json from '../serialization/json'
import * as urlencoded from '../serialization/urlencoded'
import * as multipart from '../serialization/multipart'
import { exhaustive } from '@/utils/typescript'

export const tryDeserialize = (body: RawBody): Body => {
  switch (body.mimeType) {
    case 'text/html':
      return html.tryDeserialize(body)

    case 'application/json':
      return json.tryDeserialize(body)

    case 'application/x-www-form-urlencoded':
      return urlencoded.tryDeserialize(body)

    case 'multipart/form-data':
      return multipart.tryDeserialize(body)

    default:
      return body
  }
}

export const serialize = (body: Body): RawBody => {
  switch (body.type) {
    case 'json':
      return json.serialize(body.data)

    case 'urlencoded':
      return urlencoded.serialize(body.params)

    case 'html':
      return html.serialize(body.document)

    case 'multipart':
      return multipart.serialize(body.params)

    case 'raw':
      return body

    default:
      return exhaustive(body)
  }
}
