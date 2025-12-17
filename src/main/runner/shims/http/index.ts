import nativeHttp from 'k6/http'

import { instrumentParams } from './utils'

// Store original methods before mutation
const originalRequest = nativeHttp.request
const originalAsyncRequest = nativeHttp.asyncRequest
const originalGet = nativeHttp.get
const originalHead = nativeHttp.head
const originalPost = nativeHttp.post
const originalPut = nativeHttp.put
const originalPatch = nativeHttp.patch
const originalDel = nativeHttp.del
const originalOptions = nativeHttp.options

interface HttpURL {
  __brand: 'http-url'
}

// Mutate the native http module to add instrumentation
nativeHttp.request = (
  method: string,
  url: string | HttpURL,
  body?: unknown,
  params?: unknown
) => {
  // @ts-expect-error - Dynamic method call
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return originalRequest(method, url, body, instrumentParams(params))
}

nativeHttp.asyncRequest = (
  method: string,
  url: string | HttpURL,
  body?: unknown,
  params?: unknown
) => {
  // @ts-expect-error - Dynamic method call
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return originalAsyncRequest(method, url, body, instrumentParams(params))
}

nativeHttp.get = (url: string | HttpURL, params?: unknown) => {
  // @ts-expect-error - Dynamic method call
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return originalGet(url, instrumentParams(params))
}

nativeHttp.head = (url: string | HttpURL, params?: unknown) => {
  // @ts-expect-error - Dynamic method call
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return originalHead(url, instrumentParams(params))
}

nativeHttp.post = (url: string | HttpURL, body?: unknown, params?: unknown) => {
  // @ts-expect-error - Dynamic method call
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return originalPost(url, body, instrumentParams(params))
}

nativeHttp.put = (url: string | HttpURL, body?: unknown, params?: unknown) => {
  // @ts-expect-error - Dynamic method call
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return originalPut(url, body, instrumentParams(params))
}

nativeHttp.patch = (
  url: string | HttpURL,
  body?: unknown,
  params?: unknown
) => {
  // @ts-expect-error - Dynamic method call
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return originalPatch(url, body, instrumentParams(params))
}

nativeHttp.del = (url: string | HttpURL, body?: unknown, params?: unknown) => {
  // @ts-expect-error - Dynamic method call
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return originalDel(url, body, instrumentParams(params))
}

nativeHttp.options = (
  url: string | HttpURL,
  body?: unknown,
  params?: unknown
) => {
  // @ts-expect-error - Dynamic method call
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return originalOptions(url, body, instrumentParams(params))
}

// Export for testing purposes
export default nativeHttp
