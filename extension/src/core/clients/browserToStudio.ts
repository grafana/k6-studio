import { z } from 'zod'

import { BrowserEvent, BrowserEventSchema } from '@/schemas/recording'
import { EventEmitter } from 'extension/src/utils/events'

import { Channel } from './messaging/channel'
import { Transport } from './messaging/transports/transport'
import { EventMap, Service } from './messaging/types'

export const browserToStudioMethods = {
  loadEvents: {
    params: z.tuple([]),
    returns: z.array(BrowserEventSchema),
  },

  recordEvents: {
    params: z.tuple([z.array(BrowserEventSchema)]),
    returns: z.void(),
  },

  navigateTo: {
    params: z.tuple([z.string()]),
    returns: z.void(),
  },

  stopRecording: {
    params: z.tuple([]),
    returns: z.void(),
  },

  reload: {
    params: z.tuple([]),
    returns: z.void(),
  },
}

export const browserToStudioEvents = z.object({
  name: z.literal('record'),
  data: z.object({
    events: z.array(BrowserEventSchema),
  }),
})

export class BrowserToStudioClient
  extends EventEmitter<EventMap<typeof browserToStudioEvents>>
  implements Service<typeof browserToStudioMethods>
{
  #channel: Channel<typeof browserToStudioMethods, typeof browserToStudioEvents>

  constructor(transport: Transport) {
    super()

    this.#channel = new Channel({
      transport,
      methods: browserToStudioMethods,
      events: browserToStudioEvents,
    })

    this.#channel.any((event, data) => {
      this.emit(event, data)
    })
  }

  loadEvents() {
    return this.#channel.call('loadEvents')
  }

  recordEvents(events: BrowserEvent[]) {
    return this.#channel.call('recordEvents', events)
  }

  navigateTo(url: string) {
    return this.#channel.call('navigateTo', url)
  }

  stopRecording() {
    return this.#channel.call('stopRecording')
  }

  reload() {
    return this.#channel.call('reload')
  }
}
