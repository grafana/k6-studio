import { z } from 'zod'

import { EventEmitter } from 'extension/src/utils/events'

import { Channel } from './messaging/channel'
import { Transport } from './messaging/transports/transport'
import { EventMap, Service } from './messaging/types'

const HighlightElementsSchema = z.object({
  type: z.literal('css'),
  selector: z.string(),
})

export const studioToBrowserMethods = {
  highlightElement: {
    params: z.tuple([HighlightElementsSchema.nullable()]),
    returns: z.void(),
  },

  navigateTo: {
    params: z.tuple([z.string()]),
    returns: z.void(),
  },
}

export const studioToBrowserEvents = z.object({
  name: z.string(),
  data: z.never(),
})

export class StudioToBrowserClient
  extends EventEmitter<EventMap<typeof studioToBrowserEvents>>
  implements Service<typeof studioToBrowserMethods>
{
  #channel: Channel<typeof studioToBrowserMethods, typeof studioToBrowserEvents>

  constructor(transport: Transport) {
    super()

    this.#channel = new Channel({
      transport,
      methods: studioToBrowserMethods,
      events: studioToBrowserEvents,
    })

    this.#channel.any((event, data) => {
      this.emit(event, data)
    })
  }

  highlightElement(selector: z.infer<typeof HighlightElementsSchema> | null) {
    return this.#channel.call('highlightElement', selector)
  }

  navigateTo(url: string) {
    return this.#channel.call('navigateTo', url)
  }
}
