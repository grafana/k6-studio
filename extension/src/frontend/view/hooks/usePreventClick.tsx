import { useEffect } from 'react'

import { useContainerElement } from '@/components/primitives/ContainerProvider'

export function usePreventClick(enabled: boolean) {
  const container = useContainerElement()

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

      ev.preventDefault()
      ev.stopPropagation()
    }

    window.addEventListener('click', preventClick, { capture: true })

    return () => {
      window.removeEventListener('click', preventClick, { capture: true })
    }
  }, [container, enabled])
}
