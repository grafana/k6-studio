import { describe, expect, it } from 'vitest'

import { findElementsByLocator } from './selectors'

describe('findElementsByLocator', () => {
  it('matches role name with substring when exact is false', () => {
    document.body.innerHTML = '<button type="button">Submit</button>'
    const matches = findElementsByLocator(document.body, {
      type: 'role',
      role: 'button',
      options: { name: 'Sub', exact: false },
    })
    expect(matches).toHaveLength(1)
    expect(matches[0]).toBeInstanceOf(HTMLButtonElement)
  })

  it('matches role name only exactly when exact is true', () => {
    document.body.innerHTML = '<button type="button">Submit</button>'
    const partial = findElementsByLocator(document.body, {
      type: 'role',
      role: 'button',
      options: { name: 'Sub', exact: true },
    })
    expect(partial).toHaveLength(0)

    const full = findElementsByLocator(document.body, {
      type: 'role',
      role: 'button',
      options: { name: 'Submit', exact: true },
    })
    expect(full).toHaveLength(1)
  })

  it('defaults role name to substring match when exact is omitted', () => {
    document.body.innerHTML = '<button type="button">Submit</button>'
    const partial = findElementsByLocator(document.body, {
      type: 'role',
      role: 'button',
      options: { name: 'Sub' },
    })
    expect(partial).toHaveLength(1)
  })
})
