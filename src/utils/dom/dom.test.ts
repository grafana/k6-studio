import { afterEach, describe, expect, it } from 'vitest'

import {
  isNativeButton,
  isNativeCheckbox,
  isNativeRadio,
  isNonButtonInput,
} from './dom'

// Elements created in a child iframe document belong to a different realm, so a
// bare `instanceof HTMLInputElement` against the top window returns false. The
// recorder feeds these functions elements from inside iframes, so they must
// resolve the constructor from the element's own realm.
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

describe('native element checks across realms', () => {
  it('isNativeCheckbox matches a checkbox inside an iframe', () => {
    const doc = childRealm()
    const checkbox = doc.createElement('input')
    checkbox.type = 'checkbox'

    expect(checkbox instanceof HTMLInputElement).toBe(false)
    expect(isNativeCheckbox(checkbox)).toBe(true)
  })

  it('isNativeRadio matches a radio inside an iframe', () => {
    const doc = childRealm()
    const radio = doc.createElement('input')
    radio.type = 'radio'

    expect(isNativeRadio(radio)).toBe(true)
  })

  it('isNativeButton matches a button and a submit input inside an iframe', () => {
    const doc = childRealm()
    const button = doc.createElement('button')
    const submit = doc.createElement('input')
    submit.type = 'submit'

    expect(isNativeButton(button)).toBe(true)
    expect(isNativeButton(submit)).toBe(true)
  })

  it('isNonButtonInput matches a text input inside an iframe', () => {
    const doc = childRealm()
    const text = doc.createElement('input')
    text.type = 'text'

    expect(isNonButtonInput(text)).toBe(true)
  })
})
