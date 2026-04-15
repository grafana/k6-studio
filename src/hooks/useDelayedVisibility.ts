import { useEffect, useState } from 'react'

/**
 * Hook that delays showing a component until a specified delay has passed.
 * Useful for preventing flickering of loading states for quick operations.
 *
 * @param delayMs The delay in milliseconds before showing the component
 * @returns A boolean indicating whether the component should be visible
 */
export function useDelayedVisibility(delayMs = 50) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true)
    }, delayMs)

    return () => {
      clearTimeout(timeout)
    }
  }, [delayMs])

  return isVisible
}
