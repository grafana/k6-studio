import { useState } from 'react'

import {
  LocatorOptions,
  ElementLocator,
  ElementLocatorOptions,
} from '@/schemas/locator'
import { flattenLocators } from '@/utils/locator'

export type TouchState = {
  [Key in ElementLocator['type']]: boolean
}

function initializeTouchState(
  values: LocatorOptions['values'],
  isTouched: boolean
): TouchState {
  return {
    placeholder: values.placeholder !== undefined && isTouched,
    label: values.label !== undefined && isTouched,
    role: values.role !== undefined && isTouched,
    text: values.text !== undefined && isTouched,
    title: values.title !== undefined && isTouched,
    testid: values.testid !== undefined && isTouched,
    css: values.css !== undefined && isTouched,
    alt: values.alt !== undefined && isTouched,
  }
}

export function useTouchStates(
  target: ElementLocatorOptions,
  initialState: boolean
) {
  const [touchStates, setTouchStates] = useState(() => {
    const state: Record<string, TouchState> = {}

    for (const frame of flattenLocators(target)) {
      state[frame.key] = initializeTouchState(frame.values, initialState)
    }

    return state
  })

  const getState = (locator: LocatorOptions) => {
    return (
      touchStates[locator.key] ?? initializeTouchState(locator.values, false)
    )
  }

  const setState = (locator: LocatorOptions, isTouched = true) => {
    setTouchStates((prev) => {
      const current =
        prev[locator.key] ?? initializeTouchState(locator.values, false)

      return {
        ...prev,
        [locator.key]: {
          ...current,
          [locator.current]: isTouched,
        },
      }
    })
  }

  return {
    get: getState,
    touch: setState,
  }
}
