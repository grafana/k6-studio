import http from 'k6/http'

import { instrumentParams } from './utils'

// Store original methods before mutation
const originalRequest = http.request
const originalAsyncRequest = http.asyncRequest

// Mutate the native http module to add instrumentation
http.request = function (method, url, body?, params?) {
  return originalRequest(method, url, body, instrumentParams(params))
}

http.asyncRequest = function (method, url, body?, params?) {
  return originalAsyncRequest(method, url, body, instrumentParams(params))
}

http.get = function (url, params?) {
  return http.request('GET', url, null, instrumentParams(params))
}

http.head = function (url, params?) {
  return http.request('HEAD', url, null, instrumentParams(params))
}

http.post = function (url, body?, params?) {
  return http.request('POST', url, body, instrumentParams(params))
}

http.put = function (url, body?, params?) {
  return http.request('PUT', url, body, instrumentParams(params))
}

http.patch = function (url, body?, params?) {
  return http.request('PATCH', url, body, instrumentParams(params))
}

http.del = function (url, body?, params?) {
  return http.request('DELETE', url, body, instrumentParams(params))
}

http.options = function (url, body?, params?) {
  return http.request('OPTIONS', url, body, instrumentParams(params))
}
