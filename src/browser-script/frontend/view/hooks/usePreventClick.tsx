import { DependencyList, useEffect, useLayoutEffect, useRef } from 'react'

import { useContainerElement } from '@/components/primitives/ContainerProvider'

interface UsePreventClickOptions {
  enabled?: boolean
  dependencies?: DependencyList
  callback?: (ev: MouseEvent) => void
}

export function usePreventClick({
  enabled = true,
  dependencies,
  callback,
}: UsePreventClickOptions) {
  const callbackRef = useRef(callback)
  const container = useContainerElement()

  useLayoutEffect(() => {
    callbackRef.current = callback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const preventClick = (ev: MouseEvent) => {
      // The user should still be able to click on elements in the in-app
      // UI so we exclude anything inside the shadow root.
      if (ev.composedPath().includes(container)) {
        return
      }

      callbackRef.current?.(ev)

      ev.preventDefault()
      ev.stopPropagation()
    }

    window.addEventListener('click', preventClick, { capture: true })

    return () => {
      window.removeEventListener('click', preventClick, { capture: true })
    }
  }, [container, enabled])
}
