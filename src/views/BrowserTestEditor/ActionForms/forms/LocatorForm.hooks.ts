import { useState } from 'react'

import { ElementLocator, LocatorOptions } from '@/schemas/locator'

export type TouchState = {
  touched: boolean
  states: {
    [Key in ElementLocator['type']]: boolean
  }
}

export interface TouchStates {
  get: (locator: LocatorOptions) => TouchState
  touch: (locator: LocatorOptions) => void
}

const DEFAULT_TOUCH_STATE: TouchState = {
  touched: false,
  states: {
    placeholder: false,
    label: false,
    role: false,
    text: false,
    title: false,
    testid: false,
    css: false,
    alt: false,
  },
}

export function useTouchStates(): TouchStates {
  const [touchStates, setTouchStates] = useState<Record<string, TouchState>>({})

  const getState = (locator: LocatorOptions): TouchState => {
    return touchStates[locator.key] ?? DEFAULT_TOUCH_STATE
  }

  const touch = (locator: LocatorOptions) => {
    setTouchStates((prev) => {
      const current = prev[locator.key] ?? DEFAULT_TOUCH_STATE

      return {
        ...prev,
        [locator.key]: {
          touched: true,
          states: {
            ...current.states,
            [locator.current]: true,
          },
        },
      }
    })
  }

  return {
    get: getState,
    touch,
  }
}
