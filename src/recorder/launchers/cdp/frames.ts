import logger from 'electron-log/main'

import {
  BrowserEvent,
  BrowserEventSchema,
  BrowserEventTarget,
} from '@/schemas/recording'
import { ChromeDevToolsClient, Page, Runtime } from '@/utils/cdp/client'

import { RECORDER_WORLD_NAME } from './script'

export const FRAME_EVENTS_BINDING = '__K6_STUDIO_RECORD_FRAME_EVENTS__'

function findChain(tree: Page.FrameTree, frameId: string): string[] | null {
  if (tree.frame.id === frameId) return [frameId]
  const child = tree.childFrames
    ?.map((frame) => findChain(frame, frameId))
    .find((path) => path !== null)
  return child ? [tree.frame.id, ...child] : null
}

export class FramePaths {
  #contexts = new Map<number, Runtime.ExecutionContextDescription>()
  #dispose: Array<() => void>
  #paths = new Map<number, Promise<BrowserEventTarget[] | null>>()

  constructor(
    private client: ChromeDevToolsClient,
    private record: (events: BrowserEvent[]) => void
  ) {
    this.#dispose = [
      client.runtime.on('executionContextCreated', ({ data: { context } }) => {
        if (context.name === RECORDER_WORLD_NAME)
          this.#contexts.set(context.id, context)
      }),
      client.runtime.on('executionContextDestroyed', ({ data }) => {
        this.#contexts.delete(data.executionContextId)
        this.#paths.delete(data.executionContextId)
      }),
      client.runtime.on('executionContextsCleared', () => {
        this.#contexts.clear()
        this.#paths.clear()
      }),
      client.runtime.on('bindingCalled', ({ data }) => {
        if (data.name !== FRAME_EVENTS_BINDING) return
        this.#record(data).catch((error) =>
          logger.warn('Dropped recording event without a frame path:', error)
        )
      }),
    ]
  }

  attach() {
    return this.client.runtime.addBinding({
      name: FRAME_EVENTS_BINDING,
      executionContextName: RECORDER_WORLD_NAME,
    })
  }

  async resolve(contextId: number): Promise<BrowserEventTarget[]> {
    const context = this.#contexts.get(contextId)
    const frameId = context?.auxData?.frameId
    if (typeof frameId !== 'string') throw new Error('Missing recorder context')
    const { frameTree } = await this.client.page.getFrameTree()
    const chain = findChain(frameTree, frameId)
    if (!chain) throw new Error('Recording frame was detached')
    const path = await Promise.all(
      chain.slice(1).map((id, index) => this.#describeOwner(id, chain[index]!))
    )
    return path
  }

  async #describeOwner(
    frameId: string,
    parentId: string
  ): Promise<BrowserEventTarget> {
    const context = [...this.#contexts.values()].find(
      (context) => context.auxData?.frameId === parentId
    )
    if (!context) throw new Error('Missing parent recorder context')
    const { backendNodeId } = await this.client.dom.getFrameOwner(frameId)
    const { object } = await this.client.dom.resolveNode({
      backendNodeId,
      executionContextId: context.id,
    })
    if (!object.objectId) throw new Error('Could not resolve frame owner')
    try {
      const { result, exceptionDetails } =
        await this.client.runtime.callFunctionOn({
          objectId: object.objectId,
          functionDeclaration:
            'function() { return window.__K6_STUDIO_RECORDER_RUNTIME__.describeElement(this) }',
          returnByValue: true,
        })
      if (exceptionDetails || !result.value)
        throw new Error('Could not describe frame owner')
      return result.value as BrowserEventTarget
    } finally {
      await this.client.runtime.releaseObject(object.objectId).catch(() => {})
    }
  }

  async #record(event: Runtime.BindingCalledEvent) {
    if (!this.#contexts.has(event.executionContextId)) return
    const events = BrowserEventSchema.array().parse(JSON.parse(event.payload))
    const contextId = event.executionContextId
    if (events.length === 0) {
      // Keep a path for clicks that navigate before CDP can describe the owners again.
      this.#paths.set(
        contextId,
        this.resolve(contextId).catch(() => null)
      )
      return
    }
    const cached = this.#paths.get(contextId)
    const pending = this.resolve(contextId).catch(async (error) => {
      const previous = await cached
      if (previous === null || previous === undefined) throw error
      return previous
    })
    this.#paths.set(
      contextId,
      pending.catch(() => null)
    )
    const frames = await pending
    this.record(
      events.map((event) => (frames.length > 0 ? { ...event, frames } : event))
    )
  }

  dispose() {
    this.#dispose.forEach((dispose) => dispose())
    this.#contexts.clear()
    this.#paths.clear()
  }
}
