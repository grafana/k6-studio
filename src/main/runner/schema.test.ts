import { describe, expect, it } from 'vitest'

import { AnyBrowserActionSchema, BrowserActionEventSchema } from './schema'

describe('Runner action schema', () => {
  it('parses page.close action', () => {
    const action = { method: 'page.close' }

    expect(AnyBrowserActionSchema.parse(action)).toEqual(action)
  })

  it('rejects unsupported page action method', () => {
    const action = { method: 'page.cloze' }

    expect(AnyBrowserActionSchema.safeParse(action).success).toBe(false)
  })

  it('parses begin event with page.close action', () => {
    const event = {
      type: 'begin',
      eventId: 'evt-1',
      timestamp: {
        started: 1700000000000,
      },
      action: {
        method: 'page.close',
      },
    }

    expect(BrowserActionEventSchema.parse(event)).toEqual(event)
  })

  it('parses end event with page.close action', () => {
    const event = {
      type: 'end',
      eventId: 'evt-2',
      timestamp: {
        started: 1700000000000,
        ended: 1700000001000,
      },
      action: {
        method: 'page.close',
      },
      result: {
        type: 'success',
      },
    }

    expect(BrowserActionEventSchema.parse(event)).toEqual(event)
  })
})
