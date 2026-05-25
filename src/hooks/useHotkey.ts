import { useEffect, useRef } from 'react'

export interface Hotkey {
  key: string
  metaKey?: boolean
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
}

function matchesHotkey(event: KeyboardEvent, hotkey: Hotkey) {
  if (event.key !== hotkey.key) return false
  if (hotkey.metaKey && !event.metaKey) return false
  if (hotkey.ctrlKey && !event.ctrlKey) return false
  if (hotkey.shiftKey && !event.shiftKey) return false
  if (hotkey.altKey && !event.altKey) return false
  return true
}

export function useHotkey(hotkeys: Hotkey | Hotkey[], callback: () => void) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const entries = Array.isArray(hotkeys) ? hotkeys : [hotkeys]

    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat) return
      if (entries.some((hotkey) => matchesHotkey(event, hotkey))) {
        event.preventDefault()
        callbackRef.current()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hotkeys])
}
