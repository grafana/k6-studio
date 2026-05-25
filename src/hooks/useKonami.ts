import { useEffect, useRef } from 'react'

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

export function useKonami(onUnlock: () => void) {
  const indexRef = useRef(0)
  const onUnlockRef = useRef(onUnlock)
  onUnlockRef.current = onUnlock

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === KONAMI_CODE[indexRef.current]) {
        indexRef.current++
        if (indexRef.current === KONAMI_CODE.length) {
          indexRef.current = 0
          onUnlockRef.current()
        }
      } else {
        indexRef.current = 0
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
