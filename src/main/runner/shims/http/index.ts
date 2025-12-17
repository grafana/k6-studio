import nativeHttp from 'k6/http'

import { instrumentParams } from './utils'

const INSTRUMENTED_METHODS = new Set<keyof typeof nativeHttp>([
  'request',
  'asyncRequest',
  'get',
  'post',
  'put',
  'patch',
  'del',
  'head',
  'options',
])

const http = new Proxy(nativeHttp, {
  get(target, prop) {
    const original = target[prop as keyof typeof nativeHttp]

    if (
      typeof prop === 'symbol' ||
      !INSTRUMENTED_METHODS.has(prop as keyof typeof nativeHttp)
    ) {
      return original
    }

    // Return wrapper that instruments the last argument
    return function (...args: unknown[]) {
      const lastArgIndex = args.length - 1
      if (lastArgIndex >= 0 && args[lastArgIndex] != null) {
        args[lastArgIndex] = instrumentParams(args[lastArgIndex])
      }
      // @ts-expect-error - We know that original is a function here
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return original(...args)
    }
  },
})

export default http
