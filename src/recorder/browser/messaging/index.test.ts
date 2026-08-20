import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest'
import { z } from 'zod/v4'

import { NullTransport } from './transports/null'

import { BrowserExtensionClient, BrowserExtensionClientOptions } from './index'

/**
 * Simulates the remote end of the transport sending us a raw envelope.
 */
function receive(transport: NullTransport, data: unknown) {
  transport.emit('message', { data })
}

// The shape the in-page recorder sent when a page polluted Array.prototype
// with a toJSON method: `events` arrives double-encoded as a string.
const doubleEncodedEnvelope = {
  type: 'message',
  data: {
    type: 'record-events',
    events: JSON.stringify([{ type: 'click' }]),
  },
}

const validEnvelope = {
  type: 'message',
  data: {
    type: 'load-events',
  },
}

describe('BrowserExtensionClient', () => {
  const clients: BrowserExtensionClient[] = []

  let consoleError: MockInstance<typeof console.error>

  function createClient(options?: BrowserExtensionClientOptions) {
    const transport = new NullTransport()
    const client = new BrowserExtensionClient('test-client', transport, options)

    clients.push(client)

    return { client, transport }
  }

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    clients.forEach((client) => client.dispose())
    clients.length = 0

    vi.restoreAllMocks()
  })

  it('notifies onInvalidMessage when a message fails validation', () => {
    const onInvalidMessage = vi.fn<(error: z.ZodError) => void>()
    const { transport } = createClient({ onInvalidMessage })

    receive(transport, doubleEncodedEnvelope)

    expect(onInvalidMessage).toHaveBeenCalledOnce()

    const [error] = onInvalidMessage.mock.calls[0] ?? []

    expect(error).toBeInstanceOf(z.ZodError)
    expect(error?.issues).toEqual([
      expect.objectContaining({
        code: 'invalid_type',
        path: ['data', 'events'],
      }),
    ])
  })

  it('logs invalid messages when no callback was given', () => {
    const { transport } = createClient()

    expect(() => receive(transport, doubleEncodedEnvelope)).not.toThrow()
    expect(consoleError).toHaveBeenCalledOnce()
  })

  // The message can carry recorded user input, including passwords, and main
  // process console output becomes a Sentry breadcrumb on the reported event.
  it('does not log the contents of an invalid message', () => {
    const { transport } = createClient()

    receive(transport, {
      type: 'message',
      data: {
        type: 'record-events',
        events: JSON.stringify([{ type: 'input-change', value: 'hunter2' }]),
      },
    })

    expect(JSON.stringify(consoleError.mock.calls)).not.toContain('hunter2')
  })

  it('does not notify onInvalidMessage for valid messages', () => {
    const onInvalidMessage = vi.fn<(error: z.ZodError) => void>()
    const { client, transport } = createClient({ onInvalidMessage })
    const onLoadEvents = vi.fn()

    client.on('load-events', onLoadEvents)

    receive(transport, validEnvelope)

    expect(onLoadEvents).toHaveBeenCalledOnce()
    expect(onInvalidMessage).not.toHaveBeenCalled()
  })
})
