import { Request } from '@/types'
import { TextSelector } from '@/types/rules'
import { exhaustive } from '@/utils/typescript'

import { replaceAllBody, replaceAllHeader, replaceAllUrl } from '../shared'

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
      return replaceAllBody(request, selector.value, value)

    case 'headers':
      return replaceAllHeader(request, selector.value, value)

    case 'url':
      return replaceAllUrl(request, selector.value, value)

    default:
      return exhaustive(selector.from)
  }
}
