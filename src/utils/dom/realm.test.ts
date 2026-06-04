import { afterEach, describe, expect, it } from 'vitest'

import {
  isElement,
  isHTMLAnchorElement,
  isHTMLButtonElement,
  isHTMLIFrameElement,
  isHTMLInputElement,
  isHTMLLabelElement,
  isHTMLSelectElement,
  isHTMLTextAreaElement,
} from './realm'

// jsdom gives each iframe its own realm, so an element created in a child
// document is NOT an instance of the top window's constructors. This mirrors
// what happens to elements inside iframes in the recorder and session replay.
function childRealm(): Document {
  const iframe = document.createElement('iframe')
  document.body.append(iframe)

  const doc = iframe.contentDocument

  if (doc === null) {
    throw new Error('iframe has no contentDocument')
  }

  return doc
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('realm-safe DOM guards', () => {
  it.for([
    ['input', HTMLInputElement, isHTMLInputElement],
    ['button', HTMLButtonElement, isHTMLButtonElement],
    ['select', HTMLSelectElement, isHTMLSelectElement],
    ['textarea', HTMLTextAreaElement, isHTMLTextAreaElement],
    ['label', HTMLLabelElement, isHTMLLabelElement],
    ['a', HTMLAnchorElement, isHTMLAnchorElement],
    ['iframe', HTMLIFrameElement, isHTMLIFrameElement],
  ] as const)(
    'matches <%s> created in a child realm, where bare instanceof fails',
    ([tag, ctor, guard], { expect }) => {
      const element = childRealm().createElement(tag)

      // The top-window constructor does not match across the realm boundary.
      expect(element).not.toBeInstanceOf(ctor)
      expect(guard(element)).toBe(true)
    }
  )

  it('reject elements of a different type', () => {
    const doc = childRealm()
    const input = doc.createElement('input')

    expect(isHTMLButtonElement(input)).toBe(false)
    expect(isHTMLIFrameElement(input)).toBe(false)
  })

  it('match a cross-realm element whose document has no browsing context', () => {
    const doc = childRealm()
    const input = doc.createElement('input')

    // A detached frame's document loses its defaultView. The guard must not fall
    // back to the top window's constructor, which would misclassify the element
    // as it lives in the child realm.
    Object.defineProperty(doc, 'defaultView', {
      value: null,
      configurable: true,
    })

    expect(input instanceof HTMLInputElement).toBe(false)
    expect(isHTMLInputElement(input)).toBe(true)
  })

  it('return false for null and undefined', () => {
    expect(isHTMLInputElement(null)).toBe(false)
    expect(isHTMLInputElement(undefined)).toBe(false)
    expect(isHTMLIFrameElement(null)).toBe(false)
  })

  describe('isElement', () => {
    it('is true for a cross-realm element', () => {
      const div = childRealm().createElement('div')

      expect(div instanceof Element).toBe(false)
      expect(isElement(div)).toBe(true)
    })

    it('is false for a locator object and other non-elements', () => {
      expect(isElement({ type: 'css', selector: 'button' })).toBe(false)
      expect(isElement(null)).toBe(false)
      expect(isElement(undefined)).toBe(false)
      expect(isElement('button')).toBe(false)
    })
  })
})
