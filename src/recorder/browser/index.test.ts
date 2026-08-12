import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { RecorderRuntime } from './index'

const createClient = vi.fn()
const configureStorage = vi.fn()
const initializeView = vi.fn()
const trackTabFocus = vi.fn()
const startRecording = vi.fn()

vi.mock('./routing', () => ({
  createClient: () => createClient() as never,
}))
vi.mock('./storage', () => ({
  configureStorage: (client: unknown) => configureStorage(client) as never,
}))
vi.mock('./view', () => ({
  initializeView: (client: unknown, storage: unknown) =>
    initializeView(client, storage) as never,
}))
vi.mock('./window', () => ({
  trackTabFocus: (client: unknown) => trackTabFocus(client) as never,
}))
vi.mock('./recording', () => ({
  startRecording: (client: unknown, storage: unknown) =>
    startRecording(client, storage) as never,
}))
vi.mock('./view/inspection', () => ({
  attachInspectionDetection: () => {},
  attachTextSelectionDetection: () => {},
}))

async function runEntrypoint() {
  vi.resetModules()

  await import('./index')
}

describe('recorder entrypoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    delete window.__K6_STUDIO_RECORDER_RUNTIME__

    createClient.mockReturnValue({ fake: 'client' })
    configureStorage.mockReturnValue({ fake: 'storage' })
  })

  it('creates the runtime and remembers it on the window', async () => {
    await runEntrypoint()

    expect(createClient).toHaveBeenCalledOnce()
    expect(trackTabFocus).toHaveBeenCalledOnce()
    expect(window.__K6_STUDIO_RECORDER_RUNTIME__).toEqual({
      client: { fake: 'client' },
      storage: { fake: 'storage' },
    })
  })

  // Re-injection after document.open() runs a fresh copy of the whole script
  // in the same realm. The previous copy's connection and timers survived the
  // document swap, so creating new ones would accumulate a socket, keepalive
  // timers, and a focus poll on every document.open().
  it('reuses the previous runtime when re-injected into the same realm', async () => {
    const runtime = {
      client: { fake: 'existing-client' },
      storage: { fake: 'existing-storage' },
    } as unknown as RecorderRuntime

    window.__K6_STUDIO_RECORDER_RUNTIME__ = runtime

    await runEntrypoint()

    expect(createClient).not.toHaveBeenCalled()
    expect(configureStorage).not.toHaveBeenCalled()
    expect(trackTabFocus).not.toHaveBeenCalled()

    // The per-document work must still run with the surviving runtime.
    expect(initializeView).toHaveBeenCalledWith(runtime.client, runtime.storage)
    expect(startRecording).toHaveBeenCalledWith(runtime.client, runtime.storage)
  })
})
