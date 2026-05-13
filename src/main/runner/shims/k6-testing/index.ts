// @ts-expect-error - This module will be replaced at build time with the actual k6-testing library, which exports the expect function.
// eslint-disable-next-line import/no-unresolved
import { expect } from '__K6_TESTING_EXPECT_PATH__'
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

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
if ('use' in expect && typeof expect.use === 'function') {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  expect.use({
    name: 'k6-studio-tracking',
    onBegin(context: OnBeginContext) {
      return beginAssertion(
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
  })
}

// @ts-expect-error - This module will be replaced at build time with the actual k6-testing library, which exports the expect function.
// eslint-disable-next-line import/no-unresolved
export * from '__K6_TESTING_EXPECT_PATH__'
