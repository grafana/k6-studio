import { Request } from '@/types'
import { TextSelector } from '@/types/rules'
import { exhaustive } from '@/utils/typescript'

import { replaceContent, replaceUrl, replaceHeaders } from '../shared'

export function replaceText(
  request: Request,
  selector: TextSelector,
  value: string
): Request | undefined {
  if (selector.value.trim() === '') {
    return
  }

  switch (selector.from) {
    case 'body':
      return replaceTextBody(request, selector, value)

    case 'headers':
      return replaceTextHeader(request, selector, value)

    case 'url':
      return replaceTextUrl(request, selector, value)

    default:
      return exhaustive(selector.from)
  }
}

function replaceTextBody(
  request: Request,
  selector: TextSelector,
  value: string
): Request | undefined {
  if (!request?.content?.includes(selector.value)) {
    return
  }

  return {
    ...request,
    content: replaceContent(request.content, selector.value, value),
  }
}

function replaceTextUrl(
  request: Request,
  selector: TextSelector,
  value: string
): Request | undefined {
  if (!request.url.includes(selector.value)) {
    return
  }
  return {
    ...request,
    url: replaceUrl(request.url, selector.value, value),
    path: replaceUrl(request.path, selector.value, value),
    host: replaceUrl(request.host, selector.value, value),
  }
}

function replaceTextHeader(
  request: Request,
  selector: TextSelector,
  value: string
): Request | undefined {
  const headerExists = request?.headers.find(([, value]) =>
    value.includes(selector.value)
  )

  if (!headerExists) {
    return
  }

  return {
    ...request,
    headers: replaceHeaders(request.headers, selector.value, value),
  }
}
