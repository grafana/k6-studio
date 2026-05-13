import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { ZodType } from 'zod'

class LocalStorageSyncEvent<T> extends CustomEvent<{
  key: string
  senderId: string
  value: T
}> {
  constructor(key: string, senderId: string, value: T) {
    super('local-storage-sync', { detail: { key, senderId, value } })
  }
}

export function useSyncedLocalStorage<T>(
  key: string,
  schema: ZodType<T>,
  defaultValue: T
): [T, (value: T) => void] {
  const senderId = useId()
  const defaultValueRef = useRef(defaultValue)
  const schemaRef = useRef(schema)
  schemaRef.current = schema

  const readFromStorage = useCallback((): T => {
    let item: string | null = null

    try {
      item = localStorage.getItem(key)
    } catch {
      return defaultValueRef.current
    }

    if (item === null) {
      return defaultValueRef.current
    }

    let json: unknown
    try {
      json = JSON.parse(item)
    } catch {
      localStorage.setItem(key, JSON.stringify(defaultValueRef.current))
      return defaultValueRef.current
    }

    const parsed = schemaRef.current.safeParse(json)

    if (!parsed.success) {
      localStorage.setItem(key, JSON.stringify(defaultValueRef.current))
      return defaultValueRef.current
    }

    return parsed.data
  }, [key])

  const [storedValue, setStoredValue] = useState<T>(readFromStorage)

  useUpdateEffect(() => {
    setStoredValue(readFromStorage())
  }, [readFromStorage])

  useEffect(() => {
    const handleSyncEvent = (event: Event) => {
      if (
        event instanceof LocalStorageSyncEvent === false ||
        event.detail.key !== key ||
        event.detail.senderId === senderId
      ) {
        return
      }

      const parsed = schemaRef.current.safeParse(event.detail.value)

      if (parsed.success) {
        setStoredValue(parsed.data)
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

      let json: unknown
      try {
        json = JSON.parse(event.newValue)
      } catch {
        return
      }

      const parsed = schemaRef.current.safeParse(json)

      if (parsed.success) {
        setStoredValue(parsed.data)
      }
    }

    window.addEventListener('local-storage-sync', handleSyncEvent)
    window.addEventListener('storage', handleStorageEvent)

    return () => {
      window.removeEventListener('local-storage-sync', handleSyncEvent)
      window.removeEventListener('storage', handleStorageEvent)
    }
  }, [key, senderId])

  const setValue = useCallback(
    (value: T) => {
      setStoredValue(value)

      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {
        return
      }

      window.dispatchEvent(new LocalStorageSyncEvent(key, senderId, value))
    },
    [key, senderId]
  )

  return [storedValue, setValue]
}
