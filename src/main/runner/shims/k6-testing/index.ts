import {
  Expectations,
  ExpectConfig,
  ExpectFunction,
  ExpectPlugin,
  MatcherFn,
  expect as nativeExpect,
  // eslint-disable-next-line import/no-unresolved
} from '__K6_TESTING_EXPECT_PATH__'

import '../symbols'
import type { AssertionBeginEvent, AssertionEndEvent } from '../../schema'

import { beginAssertion, endAssertion } from './utils'

declare module 'k6/browser' {
  // We extend these interfaces to ba able to track specific instances
  interface Page {
    __id?: string
  }

  interface BrowserContext {
    __id?: string
  }
}

interface OnBeginContext {
  received: unknown
  negated: boolean
  matcher: {
    name: string
    args: unknown[]
  }
}

interface OnEndContext {
  result:
    | { state: 'pass' }
    | { state: 'fail'; message: { custom?: string }; error: unknown }
    | { state: 'error'; error: unknown }
}

function makePlugin(traceId?: string): ExpectPlugin {
  return {
    name: 'k6-studio-tracking',
    onBegin(context: OnBeginContext) {
      return beginAssertion(
        traceId,
        context.matcher.name,
        context.negated,
        context.received,
        context.matcher.args
      )
    },
    onEnd(context: OnEndContext, state: AssertionBeginEvent | null) {
      const result =
        context.result.state === 'pass'
          ? { type: 'pass' }
          : context.result.state === 'fail'
            ? {
                type: 'fail',
                message: context.result.message.custom,
                error: context.result.error,
              }
            : {
                type: 'error',
                message: String(context.result.error),
                error: context.result.error,
              }

      endAssertion(state, result as AssertionEndEvent['result'])
    },
  }
}

function appendPlugin(baseConfig: ExpectConfig, plugin: ExpectPlugin) {
  const plugins =
    baseConfig.plugins?.filter((plugin) => plugin.name !== plugin.name) ?? []

  return {
    ...baseConfig,
    plugins: [...plugins, plugin],
  }
}

function proxyMatchers<T>(
  traceId: string | undefined,
  baseExpect: ExpectFunction,
  soft: boolean,
  negated: boolean,
  value: T,
  customMessage: string | undefined
) {
  const matchers = baseExpect(value)

  return new Proxy(negated ? matchers.not : matchers, {
    get(target, prop) {
      const name = prop as keyof Expectations<T>

      if (name === 'not') {
        return proxyMatchers(
          traceId,
          baseExpect,
          soft,
          !negated,
          value,
          customMessage
        )
      }

      const matcher = target[name] as MatcherFn

      if (typeof matcher !== 'function') {
        return matcher
      }

      return (...args: unknown[]) => {
        let handled = false

        // The assertion might fail without aborting execution when using soft assertions, so we want to make
        // sure that we only track the pass or error results if the assertion has not been tracked as failed already.
        // This utility function ensure that only one of the handlers can be called.
        function once<Args extends unknown[]>(
          callback: (...args: Args) => void
        ) {
          return (...args: Args) => {
            if (handled) {
              return
            }

            handled = true

            return callback(...args)
          }
        }

        const event = beginAssertion(
          traceId,
          name as string,
          negated,
          value,
          args
        )

        const handlePass = once(() => {
          endAssertion(event, {
            type: 'pass',
          })
        })

        const handleFail = once((message: string) => {
          endAssertion(event, {
            type: 'fail',
            error: {
              format: 'custom',
              message: message,
            },
            message,
          })
        })

        const handleError = once((error: unknown) => {
          endAssertion(event, {
            type: 'error',
            error: error,
            message: error instanceof Error ? error.message : String(error),
          })
        })

        // We create a new expect instance with our tracking logic injected through the assertFn. Older versions
        // of k6-testing will call the assertFn regardless of the assertion result, so we need to handle pass and
        // fail cases here as well.
        const tracedExpect = baseExpect.configure({
          assertFn: (condition, message, soft, softMode) => {
            if (condition) {
              handlePass()
            } else {
              handleFail(message)
            }

            baseExpect.config.assertFn?.(condition, message, soft, softMode)
          },
        })

        // Pick the correct expection function based on whether this is a soft assertion or not
        const tracedExpectFn = soft
          ? tracedExpect.soft.bind(tracedExpect)
          : tracedExpect

        // Make sure that we negate the matcher correctly
        const tracedMatchers = negated
          ? tracedExpectFn(value, customMessage).not
          : tracedExpectFn(value, customMessage)

        // This is is the final matcher function that we are going to call
        const tracedMatcher = tracedMatchers[name] as MatcherFn

        try {
          const result = tracedMatcher(...args)

          // Matchers might be async, but we can't use `await` without changing the signature
          // of synchronous matchers, we use the `then`/`catch` methods instead.
          if (result instanceof Promise) {
            return result.then(handlePass).catch((error) => {
              handleError(error)

              throw error
            })
          }

          handlePass()
        } catch (error) {
          handleError(error)

          throw error
        }
      }
    },
  })
}

function installPlugin(baseExpect: ExpectFunction, traceId?: string) {
  const plugin = makePlugin(traceId)
  const config = appendPlugin(baseExpect.config, plugin)

  return baseExpect.configure(config)
}

function instrumentExpect(
  baseExpect: ExpectFunction,
  traceId?: string
): ExpectFunction {
  const expect = <T>(value: T, message?: string) => {
    if (('use' as string) in baseExpect) {
      return {
        ...baseExpect(value, message),
        $trace(id: string) {
          const tracedExpect = installPlugin(baseExpect, id)

          return tracedExpect(value, message)
        },
      }
    }

    return proxyMatchers(traceId, baseExpect, false, false, value, message)
  }

  expect.soft = <T>(value: T, message?: string) => {
    if (('use' as string) in baseExpect) {
      return {
        ...baseExpect.soft(value, message),
        $trace(id: string) {
          const tracedExpect = installPlugin(baseExpect, id)

          return tracedExpect.soft(value, message)
        },
      }
    }

    return proxyMatchers(traceId, baseExpect, true, false, value, message)
  }

  expect.configure = (options: Partial<ExpectConfig>) => {
    return instrumentExpect(baseExpect.configure(options))
  }

  expect.config = baseExpect.config
  expect.use = baseExpect.use.bind(baseExpect)

  return expect
}

// eslint-disable-next-line import/no-unresolved
export * from '__K6_TESTING_EXPECT_PATH__'

export const expect = instrumentExpect(installPlugin(nativeExpect))
