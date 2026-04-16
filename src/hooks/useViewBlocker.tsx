import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useBlocker } from 'react-router-dom'

/**
 * This hook is similar to react-router's useBlocker, but it also handles the case where the app is closing.
 * It returns a boolean indicating if the view is blocked, and two functions to cancel or confirm the blocking.
 */
export function useViewBlocker(block: boolean) {
  const [isAppClosing, setIsAppClosing] = useState(false)

  const isConfirmedRef = useRef(false)

  const blocker = useBlocker(block)

  // After confirm(), `isConfirmedRef` prevents double submission until the block condition
  // clears (e.g. debugging stopped). Reset so a later blocking session can confirm again.
  useEffect(() => {
    if (!block) {
      isConfirmedRef.current = false
    }
  }, [block])

  useEffect(() => {
    return window.studio.app.onApplicationClose(() => {
      if (block) {
        setIsAppClosing(true)

        return
      }

      window.studio.app.closeApplication()
    })
  }, [block])

  const cancel = useCallback(() => {
    setIsAppClosing(false)

    blocker.reset?.()
  }, [blocker.reset])

  const confirm = useCallback(() => {
    if (isConfirmedRef.current) {
      return
    }

    isConfirmedRef.current = true

    if (isAppClosing) {
      window.studio.app.closeApplication()

      return
    }

    blocker.proceed?.()
  }, [blocker.proceed, isAppClosing])

  const blocked = blocker.state === 'blocked' || isAppClosing

  return useMemo(() => {
    return {
      blocked,
      cancel,
      confirm,
    }
  }, [blocked, cancel, confirm])
}
