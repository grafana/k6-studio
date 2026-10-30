import * as Sentry from '@sentry/electron/main'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { BrowserExtensionClient } from '@/recorder/browser/messaging'
import { BrowserExtensionMessageSchema } from '@/recorder/browser/messaging/types'
import { createInputChangeEvent } from '@/test/factories/browserEvents'

import { BrowserServer, createInvalidMessageReporter } from './server'

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

it('rebroadcasts tool-state requests and updates to connected frames', () => {
  const client = new BrowserExtensionClient('server')
  const onRequest = vi.fn()
  const onUpdate = vi.fn()
  client.on('tool-state-request', onRequest)
  client.on('tool-state-update', onUpdate)
  const server = new BrowserServer(client)
  const request = {
    type: 'load-tool-state' as const,
    tab: 'tab-1',
    requestId: 'request-1',
  }
  const update = {
    type: 'sync-tool-state' as const,
    tab: 'tab-1',
    session: 'document-1',
    tool: 'inspect' as const,
  }

  client.send(request)
  client.send(update)

  expect(onRequest).toHaveBeenCalledWith({
    sender: undefined,
    data: { ...request, type: 'tool-state-request' },
  })
  expect(onUpdate).toHaveBeenCalledWith({
    sender: undefined,
    data: { ...update, type: 'tool-state-update' },
  })

  server.stop()
})
