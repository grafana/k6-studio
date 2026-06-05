import { describe, expect, it } from 'vitest'

import { forEachOwningFrame } from './frameChain'

interface FakeWindow {
  parent: FakeWindow
  frameElement: Element | null
}

function fakeFrame(frameElement: Element | null): FakeWindow {
  const win = { frameElement } as FakeWindow
  win.parent = win
  return win
}

const el = (id: string) => ({ id }) as unknown as Element
const idOf = (element: Element) => (element as unknown as { id: string }).id

describe('forEachOwningFrame', () => {
  it('visits each owning iframe from innermost to outermost', () => {
    const top = fakeFrame(null)
    const middle = fakeFrame(el('outer'))
    const leaf = fakeFrame(el('inner'))

    middle.parent = top
    leaf.parent = middle

    const visited: string[] = []

    forEachOwningFrame(
      leaf as unknown as Window,
      () => false,
      (iframe) => visited.push(idOf(iframe))
    )

    expect(visited).toEqual(['inner', 'outer'])
  })

  it('visits nothing for the top frame', () => {
    const top = fakeFrame(null)
    const visited: Element[] = []

    forEachOwningFrame(
      top as unknown as Window,
      () => false,
      (iframe) => visited.push(iframe)
    )

    expect(visited).toEqual([])
  })

  it('stops at the boundary window without visiting its owning iframe', () => {
    const top = fakeFrame(null)
    const boundary = fakeFrame(el('boundary'))
    const leaf = fakeFrame(el('inner'))

    boundary.parent = top
    leaf.parent = boundary

    const visited: string[] = []

    forEachOwningFrame(
      leaf as unknown as Window,
      (win) => (win as unknown as FakeWindow).parent === top,
      (iframe) => visited.push(idOf(iframe))
    )

    expect(visited).toEqual(['inner'])
  })

  it('throws when a frame in the chain has no reachable owning element', () => {
    const top = fakeFrame(null)
    const middle = fakeFrame(null)
    const leaf = fakeFrame(el('inner'))

    middle.parent = top
    leaf.parent = middle

    expect(() =>
      forEachOwningFrame(
        leaf as unknown as Window,
        () => false,
        () => {}
      )
    ).toThrow()
  })
})
