import nativeHttp from 'k6/http'

import { instrumentParams } from './utils'

const http = new Proxy(nativeHttp, {
  get(target, prop) {
    const original = target[prop as keyof typeof nativeHttp]

    if (typeof prop === 'symbol' || typeof original !== 'function') {
      return original
    }

    switch (prop) {
      case 'request':
      case 'asyncRequest':
        return (
          method: string,
          url: string,
          body?: unknown,
          params?: unknown
        ) => {
          // @ts-expect-error - Dynamic method call
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return original(method, url, body, instrumentParams(params))
        }

      case 'get':
      case 'head':
        return (url: string, params?: unknown) => {
          // @ts-expect-error - Dynamic method call
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return original(url, instrumentParams(params))
        }

      case 'post':
      case 'put':
      case 'patch':
      case 'del':
      case 'options':
        return (url: string, body?: unknown, params?: unknown) => {
          // @ts-expect-error - Dynamic method call
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return original(url, body, instrumentParams(params))
        }

      default:
        return original
    }
  },
})

export default http
