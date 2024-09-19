import { useEffect, type RefObject } from 'react'

interface UseOnClickOutsideOptions {
  ref: RefObject<HTMLElement | null>
  handler: () => void
  enabled?: boolean
}
export function useOnClickOutside({
  ref,
  handler,
  enabled = true,
}: UseOnClickOutsideOptions): void {
  useEffect(() => {
    if (!enabled) {
      return
    }

    function handleClick(ev: MouseEvent) {
      if (ev.target instanceof Node === false) {
        return
      }

      // The user might have clicked on something that was inside
      // the element but was removed as a consequence of the click.
      if (!document.contains(ev.target)) {
        return
      }

      if (ref.current && !ref.current.contains(ev.target)) {
        handler()
      }
    }

    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('click', handleClick)
    }
  }, [ref, enabled, handler])
}
