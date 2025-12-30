import { Request } from '@/types'
import { TextSelector } from '@/types/rules'
import { exhaustive } from '@/utils/typescript'

export function replaceText(
  request: Request,
  selector: TextSelector,
  value: string
): Request {
  if (selector.value.trim() === '') {
    return request
  }

  switch (selector.from) {
    case 'body':
      return replaceAllBody(request, selector.value, value)

    case 'headers':
      return replaceAllHeader(request, selector.value, value)

    case 'url':
      return replaceAllUrl(request, selector.value, value)

    default:
      return exhaustive(selector.from)
  }
}

export function replaceAllBody(
  request: Request,
  oldValue: string,
  newValue: string
): Request {
  if (!request?.content?.includes(oldValue)) {
    return request
  }

  return {
    ...request,
    content: request.content.replaceAll(oldValue, newValue),
  }
}

export function replaceAllUrl(
  request: Request,
  oldValue: string,
  newValue: string
): Request {
  if (!request.url.includes(oldValue)) {
    return request
  }

  return {
    ...request,
    url: request.url.replaceAll(oldValue, newValue),
    path: request.path.replaceAll(oldValue, newValue),
    host: request.host.replaceAll(oldValue, newValue),
  }
}

export function replaceAllHeader(
  request: Request,
  oldValue: string,
  newValue: string
): Request {
  const headerExists = request?.headers.find(([, value]) =>
    value.includes(oldValue)
  )

  if (!headerExists) {
    return request
  }

  return {
    ...request,
    headers: request.headers.map(([key, headerValue]) => {
      const replacedValue = headerValue.replaceAll(oldValue, newValue)
      return [key, replacedValue]
    }),
  }
}

export function replaceAllCookies(
  request: Request,
  oldValue: string,
  newValue: string
): Request {
  const cookieExists = request?.cookies.find(([, value]) =>
    value.includes(oldValue)
  )

  if (!cookieExists) {
    return request
  }

  return {
    ...request,
    cookies: request.cookies.map(([key, cookieValue]) => {
      const replacedValue = cookieValue.replaceAll(oldValue, newValue)
      return [key, replacedValue]
    }),
  }
}
