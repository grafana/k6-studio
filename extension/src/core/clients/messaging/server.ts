import { Channel } from './channel'
import { ErrorEnvelope, MessageEnvelopeSchema, ReturnEnvelope } from './schemas'
import { Transport } from './transports/transport'
import { AnyEventSchema, EventMap, Service, Method } from './types'

interface ServiceHandlerContext<Events extends AnyEventSchema> {
  sender: string | undefined
  emit<K extends keyof EventMap<Events>>(
    event: K,
    data: EventMap<Events>[K]
  ): void
}

type ServiceHandlerFn<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends (...args: any) => Promise<any>,
  Events extends AnyEventSchema,
> = T extends (...args: infer P) => Promise<infer R>
  ? (this: ServiceHandlerContext<Events>, ...args: P) => Promise<R> | R
  : never

type ServiceHandlers<
  T extends Record<string, Method>,
  E extends AnyEventSchema,
> = {
  [K in keyof Service<T>]?: ServiceHandlerFn<Service<T>[K], E>
}

interface ServeOptions<
  Methods extends Record<string, Method>,
  Events extends AnyEventSchema,
  Handlers extends ServiceHandlers<Methods, Events>,
> {
  transport: Transport
  methods: Methods
  events: Events
  handlers: Handlers
}

export function serve<
  Methods extends Record<string, Method>,
  Events extends AnyEventSchema,
  Handlers extends ServiceHandlers<Methods, Events>,
>({
  transport,
  methods,
  events,
  handlers,
}: ServeOptions<Methods, Events, Handlers>) {
  const channel = new Channel({
    methods,
    events,
    transport,
  })

  transport.on('message', async function ({ sender, transport, data }) {
    const envelope = MessageEnvelopeSchema.safeParse(data)

    if (!envelope.success) {
      console.error('Invalid call envelope', data, envelope.error)

      return
    }

    if (envelope.data.type !== 'call') {
      // The same transport might be used to send other types of messages
      // (like events or returns) so we just ignore them here.
      return
    }

    const definition = methods[envelope.data.method]

    if (definition === undefined) {
      transport.send({
        type: 'error',
        id: envelope.data.id,
        message: `Method ${envelope.data.method} is not defined in server schema`,
      } satisfies ErrorEnvelope)

      return
    }

    const params = definition.params.safeParse(envelope.data.params)

    if (!params.success) {
      transport.send({
        type: 'error',
        id: envelope.data.id,
        message: `Invalid parameters for method ${envelope.data.method}: ${params.error.message}`,
      } satisfies ErrorEnvelope)

      return
    }

    const handler = handlers[envelope.data.method]

    if (handler === undefined) {
      return
    }

    const transportChannel = new Channel({
      methods,
      events,
      transport,
    })

    const context: ServiceHandlerContext<Events> = {
      sender,
      emit: transportChannel.send.bind(transportChannel),
    }

    try {
      transport.send({
        type: 'return',
        id: envelope.data.id,
        result: await handler.apply(context, params.data),
      } satisfies ReturnEnvelope)
    } catch (error) {
      transport.send({
        type: 'error',
        id: envelope.data.id,
        message: `Error executing method ${envelope.data.method}: ${error instanceof Error ? error.message : String(error)}`,
      } satisfies ErrorEnvelope)
    }
  })

  type HandlerFn = ServiceHandlerFn<
    (...args: unknown[]) => Promise<unknown>,
    Events
  >

  const context: ServiceHandlerContext<Events> = {
    sender: undefined,
    emit: channel.emit.bind(channel),
  }

  const globalHandlers = Object.entries(handlers).map(
    ([method, fn]: [string, HandlerFn]) => {
      return [method, fn.bind(context)] as const
    }
  )

  return {
    handlers: Object.fromEntries(globalHandlers) as unknown as Service<Methods>,
    emit: channel.emit.bind(channel),
    [Symbol.dispose]() {
      transport[Symbol.dispose]()
    },
  }
}
