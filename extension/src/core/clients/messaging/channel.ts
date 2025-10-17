import { z } from 'zod'

import { EventEmitter } from 'extension/src/utils/events'

import {
  CallEnvelope,
  MessageEnvelopeSchema,
  EventEnvelope,
  PingEnvelope,
} from './schemas'
import { Transport } from './transports/transport'

type AnyEventSchema = z.ZodSchema<{ name: string; data: unknown }>

interface Method<
  Params extends z.ZodTuple<
    [z.ZodTypeAny, ...z.ZodTypeAny[]] | []
  > = z.ZodTuple<[z.ZodTypeAny, ...z.ZodTypeAny[]] | []>,
  Return extends z.ZodTypeAny = z.ZodTypeAny,
> {
  params: Params
  returns: Return
}

type EventMap<T extends AnyEventSchema> = {
  [K in z.infer<T>['name']]: z.infer<T>['data']
}

interface ChannelOptions<
  Service extends Record<string, Method>,
  Events extends AnyEventSchema,
> {
  methods: Service
  events: Events
  transport: Transport
}

export class Channel<
  Service extends Record<string, Method>,
  Events extends AnyEventSchema,
> extends EventEmitter<EventMap<Events>> {
  #keepAlive: NodeJS.Timeout | undefined = undefined

  #serviceSchema: Service
  #eventsSchema: Events

  #transport: Transport

  #pending = new Map<string, PromiseWithResolvers<unknown>>()

  constructor({
    methods: service,
    events,
    transport,
  }: ChannelOptions<Service, Events>) {
    super()

    this.#serviceSchema = service
    this.#eventsSchema = events

    this.#transport = transport

    this.#transport.on('message', ({ data }) => {
      const envelope = MessageEnvelopeSchema.safeParse(data)

      if (!envelope.success) {
        console.error('Invalid message envelope', data, envelope.error)

        return
      }

      if (envelope.data.type === 'ping') {
        return
      }

      if (envelope.data.type === 'call') {
        // Calls are handled by the `serve` function but they might be sent over the same
        // transport so we need to handle them here and ignore them.
        return
      }

      if (envelope.data.type === 'event') {
        const event = this.#eventsSchema.safeParse(envelope.data.event)

        if (!event.success) {
          console.error('Invalid event envelope', data, event.error)

          return
        }

        this.emit(event.data.name, event.data.data)

        return
      }

      const pending = this.#pending.get(envelope.data.id)

      if (pending === undefined) {
        return
      }

      this.#pending.delete(envelope.data.id)

      if (envelope.data.type === 'error') {
        pending.reject(new Error(envelope.data.message))

        return
      }

      pending.resolve(envelope.data.result)
    })

    this.#keepAlive = setInterval(() => {
      this.#transport.send({
        type: 'ping',
      } satisfies PingEnvelope)
    }, 5000)
  }

  async call<K extends keyof Service>(
    method: K,
    ...args: z.infer<Service[K]['params']>
  ): Promise<z.infer<Service[K]['returns']>> {
    if (typeof method !== 'string') {
      throw new Error('Method name must be a string')
    }

    const definition = this.#serviceSchema[method]

    if (definition === undefined) {
      throw new Error(`Method ${String(method)} is not defined in schema`)
    }

    const resolvers = Promise.withResolvers<unknown>()

    const id = crypto.randomUUID()

    this.#pending.set(id, resolvers)

    this.#transport.send({
      type: 'call',
      id,
      method,
      params: args,
    } satisfies CallEnvelope)

    const response = await resolvers.promise
    const returnValue = definition.returns.safeParse(response)

    if (!returnValue.success) {
      throw new Error(
        `Invalid return value for method ${String(
          method
        )}: ${returnValue.error.message}`
      )
    }

    return returnValue.data as Promise<z.infer<Service[K]['returns']>>
  }

  send<K extends keyof EventMap<Events>>(event: K, data: EventMap<Events>[K]) {
    this.#transport.send({
      type: 'event',
      event: { name: event, data },
    } satisfies EventEnvelope)
  }

  [Symbol.dispose]() {
    this.#transport[Symbol.dispose]()

    clearInterval(this.#keepAlive)
  }
}
