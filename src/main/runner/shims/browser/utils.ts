import http from 'k6/http'

import { LogEntry } from '@/schemas/k6'

import {
  ActionBeginEvent,
  ActionEndEvent,
  ActionResult,
  AnyBrowserAction,
} from '../../schema'

export const TRACKING_SERVER_URL = __ENV.K6_TRACKING_SERVER_PORT
  ? `http://localhost:${__ENV.K6_TRACKING_SERVER_PORT}`
  : null

/**
 * Never proxy actions originating from the k6-testing library.
 */
function isTestingLibrary() {
  return new Error().stack?.includes('k6-testing') ?? false
}

const nextId = (() => {
  let currentId = 0

  return () => {
    return String(currentId++)
  }
})()

export function trackLog(entry: LogEntry) {
  if (TRACKING_SERVER_URL === null) {
    return
  }

  try {
    const body = JSON.stringify({ entry } satisfies { entry: LogEntry })

    http.post(`${TRACKING_SERVER_URL}/log`, body, {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    // We don't want to interfere with the script execution so
    // we swallow all errors here.
  }
}

function begin(action: AnyBrowserAction | undefined | null) {
  if (TRACKING_SERVER_URL === null) {
    return null
  }

  if (action === undefined || action === null) {
    return null
  }

  const event = {
    type: 'begin',
    eventId: nextId(),
    timestamp: {
      started: Date.now(),
    },
    action,
  } satisfies ActionBeginEvent

  try {
    const body = JSON.stringify(event)

    http.post(`${TRACKING_SERVER_URL}/track/${event.eventId}/begin`, body, {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    // We don't want to interfere with the script execution so
    // we swallow all errors here.
    return null
  }

  return event
}

function end(event: ActionBeginEvent | null, result: ActionResult) {
  if (event === null) {
    return
  }

  try {
    const body = {
      ...event,
      type: 'end',
      timestamp: {
        ...event.timestamp,
        ended: Date.now(),
      },
      result,
    } satisfies ActionEndEvent

    http.post(
      `${TRACKING_SERVER_URL}/track/${event.eventId}/end`,
      JSON.stringify(body),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch {
    // We don't want to interfere with the script execution so
    // we swallow all errors here.
  }
}

// Type inference won't work without using the `any` type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any

type Unwrap<T> = T extends Promise<infer U> ? U : T

type ArgsOf<T> = T extends AnyFunction ? Parameters<T> : never

type TrackingFn<T extends AnyFunction> = (
  ...args: Parameters<T>
) => AnyBrowserAction

type ProxyFn<T extends AnyFunction> = (
  target: Unwrap<ReturnType<T>>,
  ...args: Parameters<T>
) => ProxyOptions<Unwrap<ReturnType<T>>> | null

export interface ProxyOptions<T extends object> {
  target: T
  tracking: {
    [P in keyof T]?: T[P] extends AnyFunction ? TrackingFn<T[P]> : never
  } & {
    $default?: (
      method: keyof T,
      ...args: ArgsOf<T[keyof T]>
    ) => AnyBrowserAction | null
  }
  proxies: {
    [P in keyof T]?: T[P] extends AnyFunction ? ProxyFn<T[P]> : never
  }
}

function getProxyMethod<T extends object>(
  method: keyof T,
  proxies: ProxyOptions<T>['proxies']
) {
  return proxies[method]
}

function getTrackingMethod<T extends object>(
  method: keyof T,
  tracking: ProxyOptions<T>['tracking']
) {
  const trackMethod = tracking[method]

  if (trackMethod !== undefined) {
    return trackMethod
  }

  const defaultTrack = tracking.$default

  if (defaultTrack !== undefined) {
    return (...args: ArgsOf<T[keyof T]>) => {
      return defaultTrack(method, ...args)
    }
  }

  return undefined
}

export function createProxy<T extends object>({
  target,
  tracking,
  proxies,
}: ProxyOptions<T>): T {
  return new Proxy(target, {
    get(target, property) {
      const method = property as keyof T
      const original = target[method]

      if (typeof original !== 'function' || isTestingLibrary()) {
        return original
      }

      const proxy = getProxyMethod(method, proxies)
      const track = getTrackingMethod(method, tracking)

      if (track === undefined && proxy === undefined) {
        return original
      }

      // A proxy function that takes care of sending events and proxying return
      // values based on the provided configuration.
      return function (...args: ArgsOf<T[keyof T]>): unknown {
        const action = track?.(...args)
        const eventId = begin(action)

        const handleSuccess = (result: unknown) => {
          end(eventId, {
            type: 'success',
            returnValue: result,
          })

          // It's only possible to proxy objects.
          if (typeof result !== 'object' || result === null) {
            return result
          }

          if (proxy !== undefined) {
            const options = proxy(
              result as Parameters<typeof proxy>[0],
              ...args
            )

            if (options === null) {
              return result
            }

            // If proxy was supplied we need to wrap the return value in a proxy
            return createProxy(options)
          }

          return result
        }

        const handleError = (error: unknown) => {
          end(eventId, {
            type: 'error',
            error: String(error),
          })

          throw error
        }

        try {
          const result: unknown = original(...args)

          // We can't use await here because it would make the proxy function
          // async whereas the original function might not have been.
          if (result instanceof Promise) {
            return result.then(handleSuccess).catch(handleError)
          }

          return handleSuccess(result)
        } catch (error) {
          handleError(error)
        }
      }
    },
  })
}
