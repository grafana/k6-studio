import http from 'k6/http'

import { instrumentParams } from './utils'

// Store original methods before mutation
const originalRequest = http.request
const originalAsyncRequest = http.asyncRequest

interface HttpURL {
  __brand: 'http-url'
}

// Mutate the native http module to add instrumentation
http.request = function <RT extends http.ResponseType | undefined>(
  method: string,
  url: string | HttpURL,
  body?: http.RequestBody | null,
  params?: http.RefinedParams<RT> | null
) {
  return originalRequest<RT>(method, url, body, instrumentParams(params))
}

http.asyncRequest = function <RT extends http.ResponseType | undefined>(
  method: string,
  url: string | HttpURL,
  body?: http.RequestBody | null,
  params?: http.RefinedParams<RT> | null
) {
  return originalAsyncRequest(method, url, body, instrumentParams(params))
}

http.get = function <RT extends http.ResponseType | undefined>(
  url: string | HttpURL,
  params?: http.RefinedParams<RT> | null
) {
  return http.request('GET', url, null, instrumentParams(params))
}

http.head = function <RT extends http.ResponseType | undefined>(
  url: string | HttpURL,
  params?: http.RefinedParams<RT> | null
) {
  return http.request('HEAD', url, null, instrumentParams(params))
}

http.post = function <RT extends http.ResponseType | undefined>(
  url: string | HttpURL,
  body?: http.RequestBody | null,
  params?: http.RefinedParams<RT> | null
) {
  return http.request('POST', url, body, instrumentParams(params))
}

http.put = function <RT extends http.ResponseType | undefined>(
  url: string | HttpURL,
  body?: http.RequestBody | null,
  params?: http.RefinedParams<RT> | null
) {
  return http.request('PUT', url, body, instrumentParams(params))
}

http.patch = function <RT extends http.ResponseType | undefined>(
  url: string | HttpURL,
  body?: http.RequestBody | null,
  params?: http.RefinedParams<RT> | null
) {
  return http.request('PATCH', url, body, instrumentParams(params))
}

http.del = function <RT extends http.ResponseType | undefined>(
  url: string | HttpURL,
  body?: http.RequestBody | null,
  params?: http.RefinedParams<RT> | null
) {
  return http.request('DELETE', url, body, instrumentParams(params))
}

http.options = function <RT extends http.ResponseType | undefined>(
  url: string | HttpURL,
  body?: http.RequestBody | null,
  params?: http.RefinedParams<RT> | null
) {
  return http.request('OPTIONS', url, body, instrumentParams(params))
}
