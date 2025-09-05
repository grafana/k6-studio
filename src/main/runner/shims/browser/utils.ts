import http from 'k6/http'

import {
  ActionBeginEvent,
  ActionEndEvent,
  ActionResult,
  BrowserAction,
} from '../../schema'

const TRACKING_SERVER_URL = __ENV.K6_TRACKING_SERVER_PORT
  ? `http://localhost:${__ENV.K6_TRACKING_SERVER_PORT}`
  : null

const nextId = (() => {
  let currentId = 0

  return () => {
    return String(currentId++)
  }
})()

function begin(action: BrowserAction | undefined) {
  if (TRACKING_SERVER_URL === null) {
    return null
  }

  if (action === undefined) {
    return null
  }

  const event = {
    eventId: nextId(),
    timestamp: Date.now(),
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
      timestamp: Date.now(),
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

type Defined<T> = Exclude<T, undefined>
type Unwrap<T> = T extends Promise<infer U> ? U : T

export interface FunctionProxy<T extends AnyFunction> {
  /**
   * Called to create a tracking event that will be sent to
   * k6 Studio. If omitted, no event will be sent.
   */
  track?: (...args: Parameters<T>) => BrowserAction

  /**
   * Called to create a new proxy for the return value of the
   * function. This allows you to proxy methods in the return
   * value. If omitted, the return value is returned as-is.
   */
  proxy?: (
    target: Unwrap<ReturnType<T>>,
    ...args: Parameters<T>
  ) => ProxiedMethods<Unwrap<ReturnType<T>>>
}

export type ProxiedMethods<T> = {
  [P in keyof T]?: T[P] extends AnyFunction ? FunctionProxy<T[P]> : never
}

export function createProxy<T extends object>(
  target: T,
  proxies: ProxiedMethods<T>
): T {
  return new Proxy(target, {
    get(target, property) {
      const original = target[property as keyof T]

      if (typeof original !== 'function' || property in proxies === false) {
        return original
      }

      const { track, proxy } = proxies[property as keyof T] ?? {}

      // A proxy function that takes care of sending events and proxying return
      // values based on the provided configuration.
      return function (...args: Parameters<Defined<typeof track>>): unknown {
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
            // If proxy was supplied we need to wrap the return value in a proxy
            return createProxy(
              result,
              proxy(result as Parameters<typeof proxy>[0], ...args)
            )
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
