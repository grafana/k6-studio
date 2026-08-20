import { afterEach, describe, expect, it, vi } from 'vitest'

import { BrowserExtensionClient } from '@/recorder/browser/messaging'
import { configureStorage } from '@/recorder/browser/storage'

import { initializeView } from './index'

// The real controls pull in portals and animation frames that keep mutating
// the DOM after the test ends. The guard under test lives in initializeView
// itself, so the UI can be inert.
vi.mock('./InBrowserControls', () => ({
  InBrowserControls: () => null,
}))

const { stopMonitoring } = vi.hoisted(() => ({ stopMonitoring: vi.fn() }))

// The monitor keeps polling on its own timers, so whether dispose stops it is
// only visible from the outside.
vi.mock('./monitor', () => ({
  monitorDocumentChange: () => stopMonitoring,
}))

function mountHosts() {
  return [...document.body.children].filter((element) => element.shadowRoot)
}

function setup() {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const client = new BrowserExtensionClient('test')
  const disposers: Array<() => void> = []

  const initialize = () => {
    const dispose = initializeView(client, configureStorage(client))

    disposers.push(dispose)

    return dispose
  }

  return {
    warn,
    initialize,
    cleanup: () => {
      // Stop the mount observers before the test environment is torn down,
      // and remove the mounts so the next test starts from a clean document.
      disposers.forEach((dispose) => dispose())
      document.body.replaceChildren()
      warn.mockRestore()
      client.dispose()
    },
  }
}

describe('initializeView', () => {
  let cleanup = () => {}

  afterEach(() => {
    cleanup()
    stopMonitoring.mockClear()
  })

  // The same document can be initialized from more than one copy of the
  // script (e.g. one injected into the initial empty document and one
  // injected when the real document commits into the same context). Two
  // initialized mounts would fight over the end of the body through
  // keepMountAtEndOfBody, locking the renderer in an infinite
  // MutationObserver loop, so any initialization after the first must be a
  // no-op. Calling initializeView twice mimics the second copy: the guard is
  // in the DOM (the mount marker), which is all a separate script copy would
  // share with us.
  it('mounts the in-browser UI only once per document', () => {
    const context = setup()

    cleanup = context.cleanup

    context.initialize()
    context.initialize()

    expect(mountHosts()).toHaveLength(1)
    expect(context.warn).toHaveBeenCalledWith(
      expect.stringContaining('already initialized')
    )
  })

  // A page that rewrites itself from its own serialized body reproduces the
  // mount marker as a dead copy: shadow roots do not serialize, so the copy
  // has no UI behind it. It must not block a fresh injection from mounting,
  // and it must be removed so it can't skew generated nth-child selectors.
  it('mounts over a stale serialized copy of a previous mount', () => {
    const context = setup()

    cleanup = context.cleanup

    const staleMount = document.createElement('div')

    staleMount.setAttribute('data-ksix-studio-mount', 'true')
    document.body.appendChild(staleMount)

    context.initialize()

    expect(mountHosts()).toHaveLength(1)
    expect(staleMount.isConnected).toBe(false)
  })

  // When two copies of the script land in the same document, the second one
  // disposes the first copy's view before initializing its own (see the
  // runtime handover in src/recorder/browser/index.ts). The disposed view must
  // leave nothing behind that the mount guard would mistake for a live UI,
  // otherwise that document never gets its toolbar back.
  it('mounts again after a previous initialization was disposed', () => {
    const context = setup()

    cleanup = context.cleanup

    const dispose = context.initialize()
    const [disposedHost] = mountHosts()

    dispose()

    context.initialize()

    expect(mountHosts()).toHaveLength(1)
    expect(disposedHost?.isConnected).toBe(false)
    expect(context.warn).not.toHaveBeenCalledWith(
      expect.stringContaining('already initialized')
    )
  })

  // The monitor re-initializes the view when the document is swapped, so a
  // monitor that outlives its view starts a second view from the disposed
  // copy's closure. That view's dispose handle is then held by a copy nobody
  // calls again, and the mount guard blocks every later injection for good.
  it('stops monitoring for a document change when disposed', () => {
    const context = setup()

    cleanup = context.cleanup

    const dispose = context.initialize()

    dispose()

    expect(stopMonitoring).toHaveBeenCalled()
  })
})
