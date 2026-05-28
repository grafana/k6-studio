import { useCallback, useRef, useState } from 'react'

import type { ActionLogEntry, Message } from './types'
import { deriveLogUpdates } from './utils/deriveLogUpdates'

export function useActionsLog() {
  const [entries, setEntries] = useState<ActionLogEntry[]>([])
  const startTimeRef = useRef(0)
  const reasoningPartsRef = useRef(new Map<string, string>())
  const lastValidationEntryIdRef = useRef<string | null>(null)

  function addEntry(
    input: Omit<ActionLogEntry, 'id' | 'timestamp'>
  ): ActionLogEntry {
    const entry: ActionLogEntry = {
      ...input,
      id: crypto.randomUUID(),
      timestamp: Date.now() - startTimeRef.current,
    }
    setEntries((prev) => [...prev, entry])
    return entry
  }

  const syncFromMessages = useCallback(function syncFromMessages(
    messages: Message[],
    isLoading: boolean
  ) {
    if (!isLoading) return

    const { added, updated } = deriveLogUpdates(
      messages,
      reasoningPartsRef.current
    )

    if (added.length === 0 && updated.length === 0) return

    const newEntries = added.map(({ partKey, text }) => {
      const entry: ActionLogEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now() - startTimeRef.current,
        type: 'reasoning',
        text,
      }
      reasoningPartsRef.current.set(partKey, entry.id)
      return entry
    })

    setEntries((prev) => {
      let result = prev

      if (updated.length > 0) {
        const updateMap = new Map(
          updated.map(({ entryId, text }) => [entryId, text])
        )
        result = result.map((entry) => {
          const newText = updateMap.get(entry.id)
          if (newText === undefined || newText === entry.text) return entry
          return { ...entry, text: newText }
        })
      }

      if (newEntries.length > 0) {
        result = [...result, ...newEntries]
      }

      return result
    })
  }, [])

  const updateValidationProgress = useCallback(
    (completed: number, total: number) => {
      const entryId = lastValidationEntryIdRef.current
      if (!entryId || total === 0) return

      const percent = Math.min(Math.round((completed / total) * 100), 100)

      setEntries((prev) => {
        const existing = prev.find((entry) => entry.id === entryId)
        if (existing?.validationProgress?.completed === completed) return prev

        return prev.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                text: `Validating (${percent}%)`,
                validationProgress: { completed, total },
              }
            : entry
        )
      })
    },
    []
  )

  const completeValidationProgress = useCallback(() => {
    const entryId = lastValidationEntryIdRef.current
    if (!entryId) return

    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              text: 'Validation complete',
              validationProgress: { completed: 1, total: 1 },
            }
          : entry
      )
    )
  }, [])

  function setValidationEntryId(id: string) {
    lastValidationEntryIdRef.current = id
  }

  function markLastReasoningAsOutcome(
    type: 'outcome-success' | 'outcome-partial' | 'outcome-failure'
  ) {
    setEntries((prev) => {
      const lastReasoning = prev.findLast((entry) => entry.type === 'reasoning')
      if (!lastReasoning) return prev
      return prev.map((entry) =>
        entry.id === lastReasoning.id ? { ...entry, type } : entry
      )
    })
  }

  function startTimer() {
    startTimeRef.current = Date.now()
  }

  function reset() {
    setEntries([])
    reasoningPartsRef.current.clear()
    lastValidationEntryIdRef.current = null
  }

  return {
    entries,
    addEntry,
    syncFromMessages,
    updateValidationProgress,
    completeValidationProgress,
    setValidationEntryId,
    markLastReasoningAsOutcome,
    startTimer,
    reset,
  }
}
