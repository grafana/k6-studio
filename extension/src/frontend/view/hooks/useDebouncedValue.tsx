import { useEffect, useRef, useState } from 'react'

interface UseDebouncedValue<T> {
  value: T
  delay: number
  maxWait: number
}

export function useDebouncedValue<T>({
  value,
  delay,
  maxWait,
}: UseDebouncedValue<T>) {
  const latestRef = useRef(value)

  const [settled, setSettled] = useState(value)
  const [debouncing, setDebouncing] = useState(false)

  useEffect(() => {
    latestRef.current = value
  }, [value])

  useEffect(() => {
    if (!debouncing) {
      return
    }

    const timeout = setTimeout(() => {
      setDebouncing(false)
      setSettled(latestRef.current)
    }, maxWait)

    return () => {
      clearTimeout(timeout)
    }
  }, [debouncing, maxWait])

  useEffect(() => {
    if (settled === value) {
      return
    }

    setDebouncing(true)

    const timeout = setTimeout(() => {
      setDebouncing(false)
      setSettled(value)
    }, delay)

    return () => {
      clearTimeout(timeout)
    }
  }, [settled, value, delay])

  return settled
}
