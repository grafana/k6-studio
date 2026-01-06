import { get, set } from 'lodash-es'

import { Request } from '@/types'
import { JsonSelector } from '@/types/rules'
import { safeJsonParse } from '@/utils/json'

import { isJsonReqResp } from '../utils'

export function getJsonObjectFromPath(json: string, path: string) {
  // TODO: https://github.com/grafana/k6-studio/issues/277
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return get(safeJsonParse(json), path)
}

function setJsonObjectFromPath(json: string, path: string, value: string) {
  const jsonObject = safeJsonParse(json)
  set(jsonObject ?? {}, path, value)
  return JSON.stringify(jsonObject)
}

export function replaceJsonBody(
  selector: JsonSelector,
  request: Request,
  value: string
): Request {
  if (!isJsonReqResp(request) || !request.content) {
    return request
  }

  // since we are using lodash and its `set` function creates missing paths we will first check that the path really
  // exists before setting it
  // TODO: https://github.com/grafana/k6-studio/issues/277
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const match = getJsonObjectFromPath(request.content, selector.path)

  if (match === undefined) return request

  const content = setJsonObjectFromPath(request.content, selector.path, value)
  return { ...request, content }
}
