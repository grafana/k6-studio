import { useState, useRef, useEffect, useMemo } from 'react'
import { useBlocker } from 'react-router-dom'

type CloseState = 'close-requested' | 'closing' | 'none'

/**
 * This hook is similar to react-router's useBlocker, but it also handles the case where the app is closing.
 * It returns a boolean indicating if the view is blocked, and two functions to cancel or confirm the blocking.
 */
export function useViewBlocker(block: boolean) {
  const [refresh, setRefresh] = useState(0)

  const blocker = useBlocker(block)

  const blockerRef = useRef(blocker)
  const closeStateRef = useRef<CloseState>('none')

  useEffect(() => {
    blockerRef.current = blocker
  }, [blocker])

  useEffect(() => {
    return window.studio.app.onApplicationClose(() => {
      if (block) {
        closeStateRef.current = 'close-requested'

        setRefresh((prev) => prev + 1)

        return
      }

      closeStateRef.current = 'closing'

      void window.studio.app.closeApplication()
    })
  }, [block])

  return useMemo(() => {
    return {
      blocked: blocker.state === 'blocked' || closeStateRef.current !== 'none',
      proceed() {
        if (closeStateRef.current === 'closing') {
          return
        }

        if (closeStateRef.current === 'close-requested') {
          closeStateRef.current = 'closing'

          void window.studio.app.closeApplication()

          return
        }

        blockerRef.current?.proceed?.()
      },
      cancel() {
        if (closeStateRef.current === 'closing') {
          return
        }

        closeStateRef.current = 'none'
        blockerRef.current?.reset?.()

        setRefresh((prev) => prev + 1)
      },
    }
  }, [blocker.state, refresh])
}
