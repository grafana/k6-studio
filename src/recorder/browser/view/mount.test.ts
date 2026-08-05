import { afterEach, describe, expect, it, vi } from 'vitest'

import { keepMountAtEndOfBody } from './mount'

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
})
