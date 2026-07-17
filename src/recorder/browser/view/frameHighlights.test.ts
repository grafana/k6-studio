import { afterEach, describe, expect, it, vi } from 'vitest'

import { cssLocatorOptions, LocatorOptions } from '@/schemas/locator'
import { BrowserEventTarget } from '@/schemas/recording'

import { BrowserExtensionClient } from '../messaging'

import * as childOverlays from './childOverlays'
import { attachFrameHighlights } from './frameHighlights'

vi.mock('./childOverlays', () => ({
  showChildOverlays: vi.fn(),
  clearChildOverlays: vi.fn(),
}))

const showChildOverlays = vi.mocked(childOverlays.showChildOverlays)
const clearChildOverlays = vi.mocked(childOverlays.clearChildOverlays)

const ownTarget = (css: string): BrowserEventTarget => ({
  selectors: { css },
})

/** A promise plus its resolve function, so a test can settle it on demand. */
function deferred<Value>() {
  let resolve: (value: Value) => void = () => {}

  const promise = new Promise<Value>((res) => {
    resolve = res
  })

  return { promise, resolve }
}

function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

afterEach(() => {
  vi.clearAllMocks()
  document.body.innerHTML = ''
})

describe('attachFrameHighlights', () => {
  it('draws overlays when the message frame chain matches this frame', async () => {
    document.body.innerHTML = '<div class="target"></div>'

    const client = new BrowserExtensionClient('test')
    const getOwnPath = vi.fn().mockResolvedValue([ownTarget('#frame')])

    attachFrameHighlights(client, getOwnPath)

    client.send({
      type: 'highlight-elements',
      locator: { type: 'css', selector: '.target' },
      frames: [cssLocatorOptions('#frame')],
    })

    await flush()

    expect(showChildOverlays).toHaveBeenCalledTimes(1)
    expect(showChildOverlays).toHaveBeenCalledWith(
      [expect.objectContaining({ top: 0, left: 0, width: 0, height: 0 })],
      { kind: 'highlight' }
    )
    expect(clearChildOverlays).not.toHaveBeenCalled()
  })

  it('clears overlays when the frame chain does not match this frame', async () => {
    const client = new BrowserExtensionClient('test')
    const getOwnPath = vi.fn().mockResolvedValue([ownTarget('#frame')])

    attachFrameHighlights(client, getOwnPath)

    client.send({
      type: 'highlight-elements',
      locator: { type: 'css', selector: '.target' },
      frames: [cssLocatorOptions('#other-frame')],
    })

    await flush()

    expect(clearChildOverlays).toHaveBeenCalledTimes(1)
    expect(clearChildOverlays).toHaveBeenCalledWith({ kind: 'highlight' })
    expect(showChildOverlays).not.toHaveBeenCalled()
  })

  it('clears overlays when frames is absent (a top-frame-only message)', async () => {
    const client = new BrowserExtensionClient('test')
    const getOwnPath = vi.fn().mockResolvedValue([ownTarget('#frame')])

    attachFrameHighlights(client, getOwnPath)

    client.send({
      type: 'highlight-elements',
      locator: { type: 'css', selector: '.target' },
    })

    await flush()

    expect(clearChildOverlays).toHaveBeenCalledTimes(1)
    expect(showChildOverlays).not.toHaveBeenCalled()
  })

  it('clears overlays when the locator is null, without waiting on own path', () => {
    const client = new BrowserExtensionClient('test')
    const getOwnPath = vi.fn().mockResolvedValue(null)

    attachFrameHighlights(client, getOwnPath)

    client.send({
      type: 'highlight-elements',
      locator: null,
      frames: [cssLocatorOptions('#frame')],
    })

    // No flush/await: clearing on a null locator must not require the own
    // path lookup to settle first.
    expect(clearChildOverlays).toHaveBeenCalledTimes(1)
    expect(getOwnPath).not.toHaveBeenCalled()
  })

  it('clears overlays and ignores non-css locator types even on a matching chain', async () => {
    const client = new BrowserExtensionClient('test')
    const getOwnPath = vi.fn().mockResolvedValue([ownTarget('#frame')])

    attachFrameHighlights(client, getOwnPath)

    client.send({
      type: 'highlight-elements',
      locator: { type: 'testid', testId: 'submit' },
      frames: [cssLocatorOptions('#frame')],
    })

    await flush()

    expect(clearChildOverlays).toHaveBeenCalledTimes(1)
    expect(showChildOverlays).not.toHaveBeenCalled()
  })

  it('clears overlays and treats a non-css frame entry as no match', async () => {
    const client = new BrowserExtensionClient('test')
    const getOwnPath = vi.fn().mockResolvedValue([ownTarget('#frame')])

    attachFrameHighlights(client, getOwnPath)

    const nonCssFrame: LocatorOptions = {
      current: 'testid',
      values: { testid: { type: 'testid', testId: 'frame-id' } },
    }

    client.send({
      type: 'highlight-elements',
      locator: { type: 'css', selector: '.target' },
      frames: [nonCssFrame],
    })

    await flush()

    expect(clearChildOverlays).toHaveBeenCalledTimes(1)
    expect(showChildOverlays).not.toHaveBeenCalled()
  })

  it('treats mismatched chain length (shorter message chain) as no match', async () => {
    const client = new BrowserExtensionClient('test')
    const getOwnPath = vi
      .fn()
      .mockResolvedValue([ownTarget('#outer'), ownTarget('#inner')])

    attachFrameHighlights(client, getOwnPath)

    client.send({
      type: 'highlight-elements',
      locator: { type: 'css', selector: '.target' },
      frames: [cssLocatorOptions('#outer')],
    })

    await flush()

    expect(clearChildOverlays).toHaveBeenCalledTimes(1)
    expect(showChildOverlays).not.toHaveBeenCalled()
  })

  it('treats mismatched chain length (longer message chain) as no match', async () => {
    const client = new BrowserExtensionClient('test')
    const getOwnPath = vi.fn().mockResolvedValue([ownTarget('#outer')])

    attachFrameHighlights(client, getOwnPath)

    client.send({
      type: 'highlight-elements',
      locator: { type: 'css', selector: '.target' },
      frames: [cssLocatorOptions('#outer'), cssLocatorOptions('#inner')],
    })

    await flush()

    expect(clearChildOverlays).toHaveBeenCalledTimes(1)
    expect(showChildOverlays).not.toHaveBeenCalled()
  })

  it('draws when a nested, multi-frame chain matches index-for-index', async () => {
    document.body.innerHTML = '<div class="target"></div>'

    const client = new BrowserExtensionClient('test')
    const getOwnPath = vi
      .fn()
      .mockResolvedValue([ownTarget('#outer'), ownTarget('#inner')])

    attachFrameHighlights(client, getOwnPath)

    client.send({
      type: 'highlight-elements',
      locator: { type: 'css', selector: '.target' },
      frames: [cssLocatorOptions('#outer'), cssLocatorOptions('#inner')],
    })

    await flush()

    expect(showChildOverlays).toHaveBeenCalledTimes(1)
    expect(clearChildOverlays).not.toHaveBeenCalled()
  })

  it('clears when a nested chain matches at the outer index but diverges at an inner one', async () => {
    const client = new BrowserExtensionClient('test')
    const getOwnPath = vi
      .fn()
      .mockResolvedValue([ownTarget('#outer'), ownTarget('#inner')])

    attachFrameHighlights(client, getOwnPath)

    client.send({
      type: 'highlight-elements',
      locator: { type: 'css', selector: '.target' },
      // Same outer frame, different inner one: a naive comparison against
      // only ownPath[0] would wrongly call this a match.
      frames: [cssLocatorOptions('#outer'), cssLocatorOptions('#other-inner')],
    })

    await flush()

    expect(clearChildOverlays).toHaveBeenCalledTimes(1)
    expect(showChildOverlays).not.toHaveBeenCalled()
  })

  it('draws with an empty bounds list when the chain matches but no element is found', async () => {
    const client = new BrowserExtensionClient('test')
    const getOwnPath = vi.fn().mockResolvedValue([ownTarget('#frame')])

    attachFrameHighlights(client, getOwnPath)

    client.send({
      type: 'highlight-elements',
      locator: { type: 'css', selector: '.does-not-exist' },
      frames: [cssLocatorOptions('#frame')],
    })

    await flush()

    expect(showChildOverlays).toHaveBeenCalledTimes(1)
    expect(showChildOverlays).toHaveBeenCalledWith([], { kind: 'highlight' })
    expect(clearChildOverlays).not.toHaveBeenCalled()
  })

  it('never matches and does not draw when the own path can never be resolved', async () => {
    const client = new BrowserExtensionClient('test')
    const getOwnPath = vi.fn().mockResolvedValue(null)

    attachFrameHighlights(client, getOwnPath)

    client.send({
      type: 'highlight-elements',
      locator: { type: 'css', selector: '.target' },
      frames: [cssLocatorOptions('#frame')],
    })

    await flush()

    expect(showChildOverlays).not.toHaveBeenCalled()
    expect(clearChildOverlays).toHaveBeenCalledTimes(1)
  })

  it('does not cache a null own path, retrying resolution on the next message', async () => {
    const client = new BrowserExtensionClient('test')
    const getOwnPath = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce([ownTarget('#frame')])

    attachFrameHighlights(client, getOwnPath)

    client.send({
      type: 'highlight-elements',
      locator: { type: 'css', selector: '.target' },
      frames: [cssLocatorOptions('#frame')],
    })

    await flush()

    expect(getOwnPath).toHaveBeenCalledTimes(1)
    expect(clearChildOverlays).toHaveBeenCalledTimes(1)

    client.send({
      type: 'highlight-elements',
      locator: { type: 'css', selector: '.target' },
      frames: [cssLocatorOptions('#frame')],
    })

    await flush()

    expect(getOwnPath).toHaveBeenCalledTimes(2)
    expect(showChildOverlays).toHaveBeenCalledTimes(1)
  })

  it('caches a resolved own path across messages instead of asking again', async () => {
    const client = new BrowserExtensionClient('test')
    const getOwnPath = vi.fn().mockResolvedValue([ownTarget('#frame')])

    attachFrameHighlights(client, getOwnPath)

    client.send({
      type: 'highlight-elements',
      locator: { type: 'css', selector: '.target' },
      frames: [cssLocatorOptions('#frame')],
    })

    await flush()

    client.send({
      type: 'highlight-elements',
      locator: { type: 'css', selector: '.target' },
      frames: [cssLocatorOptions('#frame')],
    })

    await flush()

    expect(getOwnPath).toHaveBeenCalledTimes(1)
    expect(showChildOverlays).toHaveBeenCalledTimes(2)
  })

  it('does not let a stale resolution overwrite a newer clear', async () => {
    const client = new BrowserExtensionClient('test')
    const ownPathLookup = deferred<[BrowserEventTarget] | null>()
    const getOwnPath = vi.fn().mockReturnValue(ownPathLookup.promise)

    attachFrameHighlights(client, getOwnPath)

    // First message: matches this frame, but own path resolution is slow.
    client.send({
      type: 'highlight-elements',
      locator: { type: 'css', selector: '.target' },
      frames: [cssLocatorOptions('#frame')],
    })

    // Second, newer message: a null locator clears synchronously, without
    // waiting on the own path lookup at all.
    client.send({
      type: 'highlight-elements',
      locator: null,
      frames: [cssLocatorOptions('#frame')],
    })

    expect(clearChildOverlays).toHaveBeenCalledTimes(1)

    // The slow lookup for the first (now stale) message finally resolves as
    // a match; it must not draw over the newer clear.
    ownPathLookup.resolve([ownTarget('#frame')])

    await flush()

    expect(showChildOverlays).not.toHaveBeenCalled()
    expect(clearChildOverlays).toHaveBeenCalledTimes(1)
  })

  it('applies only the newest message once a shared pending own-path lookup settles', async () => {
    document.body.innerHTML =
      '<div class="old"></div><div class="old"></div><div class="new"></div>'

    const client = new BrowserExtensionClient('test')
    const ownPathLookup = deferred<[BrowserEventTarget] | null>()
    const getOwnPath = vi.fn().mockReturnValue(ownPathLookup.promise)

    attachFrameHighlights(client, getOwnPath)

    // Both messages match this frame's chain and race the same in-flight
    // own-path lookup; only the newer one should end up drawing.
    client.send({
      type: 'highlight-elements',
      locator: { type: 'css', selector: '.old' },
      frames: [cssLocatorOptions('#frame')],
    })

    client.send({
      type: 'highlight-elements',
      locator: { type: 'css', selector: '.new' },
      frames: [cssLocatorOptions('#frame')],
    })

    expect(getOwnPath).toHaveBeenCalledTimes(1)

    ownPathLookup.resolve([ownTarget('#frame')])

    await flush()

    expect(showChildOverlays).toHaveBeenCalledTimes(1)

    const [bounds] = showChildOverlays.mock.calls[0] ?? []

    expect(bounds).toHaveLength(1)
  })
})
