import { afterEach, describe, expect, it } from 'vitest'

import { serializeElementChain } from '@/recorder/browser/serialization'
import { ElementRole } from '@/utils/dom/aria'

import { getRemoteAssociatedControl, isNativeRemote } from './ElementMenu.utils'
import { toRemoteTrackedElement } from './utils'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('isNativeRemote', () => {
  it('is native for an intrinsic role', () => {
    const role: ElementRole = { type: 'intrinsic', role: 'checkbox' }

    expect(isNativeRemote(role, false)).toBe(true)
  })

  it('is not native for an explicit role that is not a switch on a native checkbox', () => {
    const role: ElementRole = { type: 'explicit', role: 'checkbox' }

    expect(isNativeRemote(role, false)).toBe(false)
  })

  it('is native for a switch role backed by a native checkbox', () => {
    const role: ElementRole = { type: 'explicit', role: 'switch' }

    expect(isNativeRemote(role, true)).toBe(true)
  })

  it('is not native for a switch role not backed by a native checkbox', () => {
    const role: ElementRole = { type: 'explicit', role: 'switch' }

    expect(isNativeRemote(role, false)).toBe(false)
  })
})

describe('getRemoteAssociatedControl', () => {
  it('returns null when the remote element has no associated control', () => {
    document.body.innerHTML = '<div id="target"></div>'

    const target = document.querySelector('#target')

    if (target === null) {
      throw new Error('expected #target element')
    }

    const [state] = serializeElementChain(target)

    if (state === undefined) {
      throw new Error('expected a serialized state')
    }

    const remote = toRemoteTrackedElement(state, [], null, {
      left: 0,
      top: 0,
    })

    expect(getRemoteAssociatedControl(remote)).toBeNull()
  })

  it('reads the control fields from the payload associated control', () => {
    document.body.innerHTML =
      '<label id="label"></label><input type="checkbox" id="checkbox" checked />'

    const label = document.querySelector('#label')
    const checkbox = document.querySelector('#checkbox')

    if (label === null || checkbox === null) {
      throw new Error('expected #label and #checkbox elements')
    }

    const [labelState] = serializeElementChain(label)
    const [checkboxState] = serializeElementChain(checkbox)

    if (labelState === undefined || checkboxState === undefined) {
      throw new Error('expected serialized states')
    }

    const remote = toRemoteTrackedElement(
      labelState,
      [],
      null,
      { left: 0, top: 0 },
      checkboxState
    )

    const control = getRemoteAssociatedControl(remote)

    expect(control).toEqual({
      kind: 'remote',
      target: checkboxState.target,
      roles: checkboxState.roles,
      checkedState: checkboxState.checkedState,
      textBoxValue: checkboxState.textBoxValue,
      isNativeCheckbox: checkboxState.isNativeCheckbox,
      isMultilineTextBox: checkboxState.isMultilineTextBox,
    })
  })
})
