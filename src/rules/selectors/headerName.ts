import { Request, Header } from '@/types'
import { HeaderNameSelector } from '@/types/rules'

import { canonicalHeaderKey } from '../utils'

export function replaceHeaderByName(
  request: Request,
  selector: HeaderNameSelector,
  value: string
): Request {
  const headerExists = request.headers.find(
    ([key]) => canonicalHeaderKey(key) === canonicalHeaderKey(selector.name)
  )

  if (!headerExists) {
    return request
  }

  const replacedHeaders = request.headers.map(
    ([key, originalValue]): Header =>
      canonicalHeaderKey(key) === canonicalHeaderKey(selector.name)
        ? [key, value]
        : [key, originalValue]
  )

  return { ...request, headers: replacedHeaders }
}
