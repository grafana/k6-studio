import { describe, expect, it } from 'vitest'

import { findElementsBySelector } from './selectors'

describe('findElementsBySelector', () => {
  it('matches role name with substring when exact is false', () => {
    document.body.innerHTML = '<button type="button">Submit</button>'
    const matches = findElementsBySelector(document.body, {
      type: 'role',
      role: 'button',
      name: { value: 'Sub', exact: false },
    })
    expect(matches).toHaveLength(1)
    expect(matches[0]).toBeInstanceOf(HTMLButtonElement)
  })

  it('matches role name only exactly when exact is true', () => {
    document.body.innerHTML = '<button type="button">Submit</button>'
    const partial = findElementsBySelector(document.body, {
      type: 'role',
      role: 'button',
      name: { value: 'Sub', exact: true },
    })
    expect(partial).toHaveLength(0)

    const full = findElementsBySelector(document.body, {
      type: 'role',
      role: 'button',
      name: { value: 'Submit', exact: true },
    })
    expect(full).toHaveLength(1)
  })

  it('defaults role name to substring match when exact is omitted', () => {
    document.body.innerHTML = '<button type="button">Submit</button>'
    const partial = findElementsBySelector(document.body, {
      type: 'role',
      role: 'button',
      name: { value: 'Sub' },
    })
    expect(partial).toHaveLength(1)
  })
})
