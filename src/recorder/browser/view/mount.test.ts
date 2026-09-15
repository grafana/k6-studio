import { afterEach, describe, expect, it, vi } from 'vitest'

import { createMount, isDocumentMounted, keepMountAtEndOfBody } from './mount'

let dispose: (() => void) | null = null

function setup() {
  const mount = document.createElement('div')

  document.body.replaceChildren(document.createElement('main'), mount)

  dispose = keepMountAtEndOfBody(mount)

  return mount
}

async function expectLastBodyChild(mount: Element) {
  await vi.waitFor(() => {
    expect(document.body.lastElementChild).toBe(mount)
  })
}

describe('keepMountAtEndOfBody', () => {
  afterEach(() => {
    dispose?.()
    dispose = null
  })

  it('moves the mount back to the end when the page appends elements after it', async () => {
    const mount = setup()

    document.body.appendChild(document.createElement('footer'))

    await expectLastBodyChild(mount)
  })

  it('re-appends the mount when the page removes it', async () => {
    const mount = setup()

    // e.g. React hydrating the whole body treats the mount as a mismatch and
    // removes it.
    mount.remove()

    await expectLastBodyChild(mount)
  })

  it('re-appends the mount when the page replaces the body contents', async () => {
    const mount = setup()

    document.body.replaceChildren(document.createElement('main'))

    await expectLastBodyChild(mount)
  })

  // document.open() replaces the body element but does not disconnect
  // observers, so a mutation queued just before the rewrite would otherwise
  // re-append the dead mount into the new document, where its marker would
  // block the re-injected script from mounting a working UI.
  it('does not resurrect the mount into a replaced body', async () => {
    const mount = setup()
    const oldBody = document.body

    // Queue a mutation record on the observed body, then swap the body
    // element before the observer's microtask runs, like document.open()
    // rewriting the document in the same task.
    oldBody.appendChild(document.createElement('footer'))

    const newBody = document.createElement('body')

    document.documentElement.replaceChild(newBody, oldBody)

    // Let the observer's queued microtask run before asserting.
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(document.body.contains(mount)).toBe(false)
  })
})

describe('createMount', () => {
  it('removes the mount from the document when disposed', () => {
    const { mount, dispose } = createMount()

    // view/index.tsx attaches the shadow root that holds the UI, and a shadow
    // root cannot be detached again. A disposed mount left in the document
    // would keep passing for a live UI and block the next injection.
    mount.attachShadow({ mode: 'open' })

    dispose()

    expect(isDocumentMounted()).toBe(false)
    expect(mount.isConnected).toBe(false)
  })
})
