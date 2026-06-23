import { createContext, useContext } from 'react'

import { LocatorOptions } from '@/schemas/locator'

export interface FrameChain {
  // Chain of iframe locators (outermost first) the locators below live inside.
  // Used so element highlighting resolves into the right frame. Undefined means
  // the top frame.
  frames: LocatorOptions[] | undefined
  // When set, the element locator's popover renders the chain as editable
  // pills. Contexts without frame support (e.g. the validator) leave this
  // undefined and get no chain UI.
  onChange?: (frames: LocatorOptions[] | undefined) => void
}

const FrameChainContext = createContext<FrameChain>({ frames: undefined })

export const FrameChainProvider = FrameChainContext.Provider

export function useFrameChain(): FrameChain {
  return useContext(FrameChainContext)
}
