import { useCallback, useEffect, useRef, useState } from 'react'
import { ZodType } from 'zod'

class LocalStorageSyncEvent<T> extends CustomEvent<{
  key: string
  value: T
}> {
  constructor(key: string, value: T) {
    super('local-storage-sync', { detail: { key, value } })
  }
}

export function useSyncedLocalStorage<T>(
  key: string,
  schema: ZodType<T>,
  defaultValue: T
): [T, (value: T) => void] {
  const defaultValueRef = useRef(defaultValue)

  const [storedValue, setStoredValue] = useState<T>(() => {
    let item: string | null = null

    try {
      item = localStorage.getItem(key)
    } catch {
      return defaultValue
    }

    if (item === null) {
      return defaultValue
    }

    try {
      return schema.parse(JSON.parse(item))
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    let item: string | null = null

    try {
      item = localStorage.getItem(key)
    } catch {
      setStoredValue(defaultValueRef.current)
      return
    }

    if (item === null) {
      setStoredValue(defaultValueRef.current)
      return
    }

    try {
      setStoredValue(schema.parse(JSON.parse(item)))
    } catch {
      setStoredValue(defaultValueRef.current)
    }
  }, [key, schema])

  useEffect(() => {
    const handleSyncEvent = (event: Event) => {
      if (
        event instanceof LocalStorageSyncEvent === false ||
        event.detail.key !== key
      ) {
        return
      }

      try {
        const parsed = schema.safeParse(event.detail.value)

        if (parsed.success) {
          setStoredValue(parsed.data)
        }
      } catch {
        // Ignore parsing errors
      }
    }

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.storageArea !== localStorage || event.key !== key) {
        return
      }

      if (event.newValue === null) {
        setStoredValue(defaultValueRef.current)

        return
      }

      try {
        const parsed = schema.safeParse(JSON.parse(event.newValue))

        if (parsed.success) {
          setStoredValue(parsed.data)
        }
      } catch {
        // Ignore parsing errors
      }
    }

    window.addEventListener('local-storage-sync', handleSyncEvent)
    window.addEventListener('storage', handleStorageEvent)

    return () => {
      window.removeEventListener('local-storage-sync', handleSyncEvent)
      window.removeEventListener('storage', handleStorageEvent)
    }
  }, [key, schema])

  const setValue = useCallback(
    (value: T) => {
      setStoredValue(value)

      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {
        // Ignore storage errors (quota, privacy mode, etc.)
      }

      window.dispatchEvent(new LocalStorageSyncEvent(key, value))
    },
    [key]
  )

  return [storedValue, setValue]
}
