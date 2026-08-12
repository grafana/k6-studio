import { describe, expect, it, vi } from 'vitest'

import { BrowserExtensionClient } from '@/recorder/browser/messaging'
import { configureStorage } from '@/recorder/browser/storage'

import { initializeView } from './index'

// The real controls pull in portals and animation frames that keep mutating
// the DOM after the test ends. The guard under test lives in initializeView
// itself, so the UI can be inert.
vi.mock('./InBrowserControls', () => ({
  InBrowserControls: () => null,
}))

function mountHosts() {
  return [...document.body.children].filter((element) => element.shadowRoot)
}

describe('initializeView', () => {
  // The same document can be initialized from more than one copy of the
  // script (e.g. one injected into the initial empty document and one
  // injected when the real document commits into the same context). Two
  // initialized mounts would fight over the end of the body through
  // keepMountAtEndOfBody, locking the renderer in an infinite
  // MutationObserver loop, so any initialization after the first must be a
  // no-op. Calling initializeView twice mimics the second copy: the guard is
  // in the DOM (the mount marker), which is all a separate script copy would
  // share with us.
  it('initializes the in-browser UI only once per document', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const client = new BrowserExtensionClient('test')

    const disposeFirst = initializeView(client, configureStorage(client))
    const disposeSecond = initializeView(client, configureStorage(client))

    expect(mountHosts()).toHaveLength(1)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('already initialized')
    )

    // Stop the mount observers before the test environment is torn down.
    disposeFirst()
    disposeSecond()
    warn.mockRestore()
    client.dispose()
  })
})
