import { Request } from '@/types'
import { ReplacerSelector } from '@/types/rules'
import { exhaustive } from '@/utils/typescript'

import { replaceBeginEnd } from './beginEnd'
import { replaceHeaderByName } from './headerName'
import { replaceJsonBody } from './json'
import { replaceRegex } from './regex'
import { replaceText } from './text'

export function replaceRequestValues({
  selector,
  value,
  request,
}: {
  selector: ReplacerSelector
  request: Request
  value: string
}): Request {
  switch (selector.type) {
    case 'begin-end':
      return replaceBeginEnd(selector, request, value)
    case 'regex':
      return replaceRegex(selector, request, value)
    case 'json':
      return replaceJsonBody(selector, request, value)
    case 'header-name':
      return replaceHeaderByName(request, selector, value)
    case 'text':
      return replaceText(request, selector, value)
    default:
      return exhaustive(selector)
  }
}
