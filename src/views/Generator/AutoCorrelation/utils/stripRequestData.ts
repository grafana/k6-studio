import { produce } from 'immer'
import { flow } from 'lodash-es'

import { ProxyData } from '@/types'
import { safeAtob } from '@/utils/format'
import { isNonStaticAssetResponse } from '@/utils/staticAssets'

export function prepareRequestsForAI(requests: ProxyData[]) {
  return requests
    .filter(
      (data) => isNotOptionsRequest(data) && isNonStaticAssetResponse(data)
    )
    .map(stripUnnecessaryData)
}

function isNotOptionsRequest(request: ProxyData) {
  return request.request.method !== 'OPTIONS'
}

export function stripUnnecessaryData(data: ProxyData) {
  return flow(
    filterRequestHeaders,
    filterResponseHeaders,
    parseRequestBody,
    parseResponseBody,
    filterRequestProperties
  )(data)
}

function filterRequestProperties(data: ProxyData) {
  const { request } = data

  const requestData = {
    method: request.method,
    url: request.url,
    path: request.path,
    content: request.content,
    cookies: request.cookies,
    headers: request.headers,
  }

  if (!data.response) {
    return {
      request: requestData,
    }
  }

  const { response } = data

  return {
    request: requestData,

    response: {
      statusCode: response.statusCode,
      content: response.content,
      headers: response.headers,
      cookies: response.cookies,
    },
  }
}

function filterRequestHeaders(data: ProxyData) {
  return produce(data, (draft) => {
    draft.request.headers = draft.request.headers.filter(
      ([key]) => !key.toLowerCase().includes('sec-')
    )
  })
}

function filterResponseHeaders(data: ProxyData) {
  return produce(data, (draft) => {
    if (draft.response) {
      // TODO: research what other headers may contain relevant info
      draft.response.headers = draft.response.headers.filter(([key]) =>
        key.toLowerCase().includes('cookie')
      )
    }
  })
}

function parseRequestBody(data: ProxyData) {
  return produce(data, (draft) => {
    if (draft.request.content) {
      draft.request.content = safeAtob(draft.request.content)
    }
  })
}

function parseResponseBody(data: ProxyData) {
  return produce(data, (draft) => {
    if (draft.response?.content) {
      draft.response.content = safeAtob(draft.response.content)
    }
  })
}
