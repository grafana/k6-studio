import {
  RequestHeader,
  ResponseHeader,
  RawHeader,
  ContentType,
  Authorization,
  Header,
} from '../model/types'

const parseContentType = (raw: RawHeader): ContentType | RawHeader => {
  const [mimeType, ...rest] = raw.value.split(';')

  if (mimeType === undefined) {
    return raw
  }

  const params = rest
    .map((p) => p.split('='))
    .reduce(
      (acc, [name, value = true]) => {
        const key = name?.trim()
        if (key !== undefined) {
          acc[key] = value
        }

        return acc
      },
      {} as { [name: string]: string | boolean }
    )

  return {
    type: 'content-type',
    mimeType,
    raw,
    params,
  }
}

const parseAuthorization = (raw: RawHeader): Authorization | RawHeader => {
  const [authType, credentials] = raw.value.split(' ')

  if (authType === undefined || credentials === undefined) {
    return raw
  }

  return {
    type: 'authorization',
    authType,
    credentials,
    raw,
  }
}

export const tryParseRequestHeader = ({
  name,
  value,
}: RawHeader): RequestHeader => {
  const raw: RawHeader = {
    type: 'raw',
    name,
    value,
  }

  switch (name.toLowerCase()) {
    case 'content-type':
      return parseContentType(raw)

    case 'authorization':
      return parseAuthorization(raw)

    default:
      return raw
  }
}

export const tryParseResponseHeader = ({
  name,
  value,
}: RawHeader): ResponseHeader => {
  const raw: RawHeader = {
    type: 'raw',
    name,
    value,
  }

  switch (name.toLowerCase()) {
    case 'content-type':
      return parseContentType(raw)

    default:
      return raw
  }
}

export const toRaw = (header: Header): RawHeader => {
  switch (header.type) {
    case 'content-type': {
      const params = [
        header.mimeType,
        ...Object.entries(header.params).map(([key, value]) =>
          typeof value === 'string' ? `${key}=${value}` : key
        ),
      ]

      return {
        type: 'raw',
        name: header.raw.name,
        value: params.join('; '),
      }
    }

    case 'authorization':
      return {
        type: 'raw',
        name: header.raw.name,
        value: `${header.authType} ${header.credentials}`,
      }

    default:
      return header
  }
}
