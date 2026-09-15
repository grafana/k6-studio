import * as Sentry from '@sentry/electron/main'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { BrowserExtensionMessageSchema } from '@/recorder/browser/messaging/types'
import { createInputChangeEvent } from '@/test/factories/browserEvents'

import { createInvalidMessageReporter } from './server'

vi.mock('@sentry/electron/main', () => ({
  captureMessage: vi.fn(),
}))

const captureMessage = vi.mocked(Sentry.captureMessage)

const RECORDED_PASSWORD = 'correct-horse-battery-staple'

/**
 * Produces a real validation error for the message a polluted page sends:
 * `events` double-encoded as a string, carrying recorded user input.
 */
function createValidationError() {
  const result = BrowserExtensionMessageSchema.safeParse({
    type: 'record-events',
    events: JSON.stringify([
      createInputChangeEvent({ sensitive: true, value: RECORDED_PASSWORD }),
    ]),
  })

  if (result.success) {
    throw new Error('expected the message to fail validation')
  }

  return result.error
}

describe('createInvalidMessageReporter', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('reports the validation issues to Sentry', () => {
    const error = createValidationError()

    createInvalidMessageReporter()(error)

    expect(captureMessage).toHaveBeenCalledWith(
      'Browser extension client received an invalid message',
      {
        level: 'warning',
        tags: { component: 'browser-extension-messaging' },
        extra: {
          issues: [
            {
              path: 'events',
              code: 'invalid_type',
              message: error.issues[0]?.message,
            },
          ],
        },
      }
    )
  })

  it('never sends recorded data to Sentry', () => {
    createInvalidMessageReporter()(createValidationError())

    expect(JSON.stringify(captureMessage.mock.calls)).not.toContain(
      RECORDED_PASSWORD
    )
  })

  it('reports only the first invalid message', () => {
    const report = createInvalidMessageReporter()

    report(createValidationError())
    report(createValidationError())

    expect(captureMessage).toHaveBeenCalledOnce()
  })
})
