import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { RecorderRuntime } from './index'

const createClient = vi.fn()
const configureStorage = vi.fn()
const initializeView = vi.fn()
const disposeView = vi.fn()
const trackTabFocus = vi.fn()
const disposeTabFocus = vi.fn()
const startRecording = vi.fn()
const disposeRecording = vi.fn()
const isInFrame = vi.fn<() => boolean>()
const attachInspectionDetection = vi.fn<() => () => void>()
const disposeInspection = vi.fn()
const attachTextSelectionDetection = vi.fn<() => () => void>()
const disposeTextSelection = vi.fn()

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
  attachInspectionDetection: () => attachInspectionDetection(),
  attachTextSelectionDetection: () => attachTextSelectionDetection(),
}))
vi.mock('./utils', () => ({
  isInFrame: () => isInFrame(),
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
    initializeView.mockReturnValue(disposeView)
    trackTabFocus.mockReturnValue(disposeTabFocus)
    startRecording.mockReturnValue(disposeRecording)
    isInFrame.mockReturnValue(false)
    attachInspectionDetection.mockReturnValue(disposeInspection)
    attachTextSelectionDetection.mockReturnValue(disposeTextSelection)
  })

  it('creates the runtime and remembers it on the window', async () => {
    await runEntrypoint()

    expect(createClient).toHaveBeenCalledOnce()
    expect(trackTabFocus).toHaveBeenCalledOnce()
    expect(window.__K6_STUDIO_RECORDER_RUNTIME__).toMatchObject({
      client: { fake: 'client' },
      storage: { fake: 'storage' },
    })
  })

  // Re-injection after document.open() runs a fresh copy of the whole script
  // in the same realm. The previous copy's connection and timers survived the
  // document swap, so creating new ones would accumulate a socket and
  // keepalive timers on every document.open().
  it('reuses the previous connection when re-injected into the same realm', async () => {
    const runtime = {
      client: { fake: 'existing-client' },
      storage: { fake: 'existing-storage' },
      disposeDocument: vi.fn(),
    } as unknown as RecorderRuntime

    window.__K6_STUDIO_RECORDER_RUNTIME__ = runtime

    await runEntrypoint()

    expect(createClient).not.toHaveBeenCalled()
    expect(configureStorage).not.toHaveBeenCalled()

    // The per-document work must still run with the surviving runtime.
    expect(initializeView).toHaveBeenCalledWith(runtime.client, runtime.storage)
    expect(startRecording).toHaveBeenCalledWith(runtime.client, runtime.storage)
    expect(trackTabFocus).toHaveBeenCalledWith(runtime.client)
  })

  // When two re-injections land in the same document (e.g. two rapid
  // document.open() calls), the earlier copy's recording listeners are still
  // live and would record every interaction twice. Each copy therefore
  // disposes its predecessor's per-document setup before starting its own.
  it('disposes the previous copy before setting up', async () => {
    const disposeDocument = vi.fn()

    window.__K6_STUDIO_RECORDER_RUNTIME__ = {
      client: { fake: 'existing-client' },
      storage: { fake: 'existing-storage' },
      disposeDocument,
    } as unknown as RecorderRuntime

    await runEntrypoint()

    expect(disposeDocument).toHaveBeenCalledOnce()
  })

  it('exposes a disposeDocument that tears down its own setup', async () => {
    await runEntrypoint()

    window.__K6_STUDIO_RECORDER_RUNTIME__?.disposeDocument()

    expect(disposeView).toHaveBeenCalledOnce()
    expect(disposeTabFocus).toHaveBeenCalledOnce()
    expect(disposeRecording).toHaveBeenCalledOnce()
  })

  // Child frames run inspection detection instead of the recorder UI. Its
  // listeners survive a same-document race just like the recording ones, so
  // they have to be torn down by the copy that replaces this one.
  it('disposes child-frame detection along with the rest of the document', async () => {
    isInFrame.mockReturnValue(true)

    await runEntrypoint()

    expect(trackTabFocus).not.toHaveBeenCalled()
    expect(initializeView).not.toHaveBeenCalled()

    window.__K6_STUDIO_RECORDER_RUNTIME__?.disposeDocument()

    expect(disposeInspection).toHaveBeenCalledOnce()
    expect(disposeTextSelection).toHaveBeenCalledOnce()
    expect(disposeRecording).toHaveBeenCalledOnce()
  })
})
