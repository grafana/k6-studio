import { describe, expect, it, vi } from 'vitest'

import {
  ChromeCommand,
  ChromeDevToolsClient,
  Transport,
} from '@/utils/cdp/client'

import { FramePaths } from './frames'
import { RECORDER_WORLD_NAME } from './script'

type Listener = Parameters<Transport['on']>[1]

function setup() {
  const listeners = new Map<string, Listener>()
  const commands: ChromeCommand[] = []
  const call = vi.fn(async (command: ChromeCommand): Promise<unknown> => {
    await Promise.resolve()
    commands.push(command)
    const params = command.params as Record<string, unknown>
    switch (command.method) {
      case 'Page.getFrameTree':
        return {
          frameTree: {
            frame: { id: 'top' },
            childFrames: [
              {
                frame: { id: 'outer' },
                childFrames: [{ frame: { id: 'inner' } }],
              },
            ],
          },
        }
      case 'DOM.getFrameOwner':
        return { backendNodeId: params.frameId === 'outer' ? 10 : 20 }
      case 'DOM.resolveNode':
        return { object: { objectId: String(params.backendNodeId) } }
      case 'Runtime.callFunctionOn':
        return {
          result: {
            value: { selectors: { css: `#owner-${String(params.objectId)}` } },
          },
        }
      default:
        return {}
    }
  })
  const transport: Transport = {
    call: <Return>(command: ChromeCommand) => call(command) as Promise<Return>,
    on: (event, listener) => {
      listeners.set(event, listener)
      return () => listeners.delete(event)
    },
    off: (event) => {
      listeners.delete(event)
    },
    dispose: () => {},
  }
  const client = new ChromeDevToolsClient(transport)
  const record = vi.fn()
  const paths = new FramePaths(client, record)
  const emit = (method: string, data: unknown) =>
    listeners.get(method)?.({ method, data } as never)
  const context = (id: number, frameId: string, name = RECORDER_WORLD_NAME) =>
    emit('Runtime.executionContextCreated', {
      context: { id, name, auxData: { frameId } },
    })
  return { paths, commands, call, emit, context, record }
}

describe('CDP frame paths', () => {
  it('describes nested owners in their parent recorder contexts', async () => {
    const { paths, commands, context } = setup()
    context(1, 'top')
    context(2, 'outer')
    context(3, 'inner')

    await expect(paths.resolve(3)).resolves.toEqual([
      { selectors: { css: '#owner-10' } },
      { selectors: { css: '#owner-20' } },
    ])
    expect(
      commands
        .filter((c) => c.method === 'DOM.resolveNode')
        .map((c) => (c.params as Record<string, unknown>).executionContextId)
    ).toEqual([1, 2])
    expect(
      commands.filter((c) => c.method === 'Runtime.releaseObject')
    ).toHaveLength(2)
    paths.dispose()
  })

  it('rejects missing ancestors instead of returning a partial path', async () => {
    const { paths, context } = setup()
    context(1, 'top')
    context(3, 'inner')
    await expect(paths.resolve(3)).rejects.toThrow('recorder context')
    paths.dispose()
  })

  it('ignores main worlds and invalidates destroyed contexts', async () => {
    const { paths, context, emit } = setup()
    context(1, 'top', '')
    await expect(paths.resolve(1)).rejects.toThrow('recorder context')
    context(2, 'top')
    emit('Runtime.executionContextDestroyed', { executionContextId: 2 })
    await expect(paths.resolve(2)).rejects.toThrow('recorder context')
    paths.dispose()
  })

  it('invalidates all contexts after navigation clears the runtime', async () => {
    const { paths, context, emit } = setup()
    context(1, 'top')
    emit('Runtime.executionContextsCleared', {})
    await expect(paths.resolve(1)).rejects.toThrow('recorder context')
    paths.dispose()
  })

  it('finishes resolving an event after its requesting context is destroyed', async () => {
    const { paths, context, emit, call } = setup()
    context(1, 'top')
    context(2, 'outer')
    const original = call.getMockImplementation()!
    call.mockImplementation(async (command) => {
      const result = await original(command)
      if (command.method === 'Runtime.callFunctionOn') {
        emit('Runtime.executionContextDestroyed', { executionContextId: 2 })
      }
      return result
    })
    await expect(paths.resolve(2)).resolves.toEqual([
      { selectors: { css: '#owner-10' } },
    ])
    paths.dispose()
  })

  it('retains a captured event when navigation removes its frame', async () => {
    const { paths, context, emit, call, record } = setup()
    context(1, 'top')
    context(2, 'outer')
    emit('Runtime.bindingCalled', {
      name: '__K6_STUDIO_RECORD_FRAME_EVENTS__',
      executionContextId: 2,
      payload: '[]',
    })
    await vi.waitFor(() =>
      expect(
        call.mock.calls.some(
          ([command]) => command.method === 'Runtime.releaseObject'
        )
      ).toBe(true)
    )
    call.mockRejectedValue(new Error('Frame detached'))
    const event = {
      type: 'reload-page',
      eventId: 'click-1',
      timestamp: 1,
      tab: 'top',
      url: 'http://test/',
    }
    emit('Runtime.bindingCalled', {
      name: '__K6_STUDIO_RECORD_FRAME_EVENTS__',
      executionContextId: 2,
      payload: JSON.stringify([event]),
    })
    emit('Runtime.executionContextDestroyed', { executionContextId: 2 })
    await vi.waitFor(() =>
      expect(record).toHaveBeenCalledWith([
        { ...event, frames: [{ selectors: { css: '#owner-10' } }] },
      ])
    )
    paths.dispose()
  })

  it('retains refreshed owner selectors when a later navigation removes the frame', async () => {
    const { paths, context, emit, call, record } = setup()
    context(1, 'top')
    context(2, 'outer')
    const binding = {
      name: '__K6_STUDIO_RECORD_FRAME_EVENTS__',
      executionContextId: 2,
    }
    emit('Runtime.bindingCalled', { ...binding, payload: '[]' })
    await vi.waitFor(() =>
      expect(
        call.mock.calls.some(
          ([command]) => command.method === 'Runtime.releaseObject'
        )
      ).toBe(true)
    )
    const original = call.getMockImplementation()!
    call.mockImplementation((command) =>
      command.method === 'Runtime.callFunctionOn'
        ? Promise.resolve({
            result: { value: { selectors: { css: '#renamed' } } },
          })
        : original(command)
    )
    const event = {
      type: 'reload-page',
      eventId: 'event-2',
      timestamp: 2,
      tab: 'top',
      url: 'http://test/',
    }
    emit('Runtime.bindingCalled', {
      ...binding,
      payload: JSON.stringify([event]),
    })
    await vi.waitFor(() =>
      expect(record).toHaveBeenCalledWith([
        { ...event, frames: [{ selectors: { css: '#renamed' } }] },
      ])
    )
    call.mockRejectedValue(new Error('Frame detached'))
    const navigation = { ...event, eventId: 'event-3', timestamp: 3 }
    emit('Runtime.bindingCalled', {
      ...binding,
      payload: JSON.stringify([navigation]),
    })
    emit('Runtime.executionContextDestroyed', { executionContextId: 2 })
    await vi.waitFor(() =>
      expect(record).toHaveBeenLastCalledWith([
        { ...navigation, frames: [{ selectors: { css: '#renamed' } }] },
      ])
    )
    paths.dispose()
  })

  it('rejects descriptor exceptions and releases the remote owner', async () => {
    const { paths, context, call, commands } = setup()
    context(1, 'top')
    context(2, 'outer')
    const original = call.getMockImplementation()!
    call.mockImplementation((command) =>
      command.method === 'Runtime.callFunctionOn'
        ? Promise.resolve({ exceptionDetails: { text: 'descriptor failed' } })
        : original(command)
    )
    await expect(paths.resolve(2)).rejects.toThrow('describe')
    expect(commands.some((c) => c.method === 'Runtime.releaseObject')).toBe(
      true
    )
    paths.dispose()
  })
})
