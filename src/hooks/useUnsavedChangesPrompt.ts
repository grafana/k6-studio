import { useEffect, useRef, useState } from 'react'
import { useBlocker } from 'react-router-dom'

interface UseUnsavedChangesPromptOptions {
  isDirty: boolean
  onSave: () => Promise<unknown>
}

export function useUnsavedChangesPrompt({
  isDirty,
  onSave,
}: UseUnsavedChangesPromptOptions) {
  const [isCloseRequested, setIsCloseRequested] = useState(false)

  const isConfirmed = useRef(false)

  const blocker = useBlocker(({ historyAction }) => {
    // Don't block navigation when redirecting (e.g. away from an invalid file)
    // TODO(router): Action enum is not exported from react-router-dom
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    return isDirty && historyAction !== 'REPLACE'
  })

  useEffect(() => {
    return window.studio.app.onApplicationClose(() => {
      if (isDirty || blocker.state === 'blocked') {
        setIsCloseRequested(true)
        return
      }

      window.studio.app.closeApplication()
    })
  }, [isDirty, blocker.state])

  const handleSave = async () => {
    try {
      isConfirmed.current = true

      const result = await onSave()

      if (result === undefined) {
        // The user chose to cancel through a save dialog, so we don't want to close the app
        cancel()

        return
      }

      if (isCloseRequested) {
        return window.studio.app.closeApplication()
      }

      blocker.proceed?.()
    } catch (error) {
      cancel()

      throw error
    }
  }

  const handleDiscard = () => {
    isConfirmed.current = true

    if (isCloseRequested) {
      return window.studio.app.closeApplication()
    }

    blocker.proceed?.()
  }

  const cancel = () => {
    isConfirmed.current = false

    setIsCloseRequested(false)

    blocker.reset?.()
  }

  const handleCancel = () => {
    // If the user has already confirmed the action by saving or discarding
    // they should no longer be able to cancel the action.
    if (isConfirmed.current) {
      return
    }

    cancel()
  }

  return {
    isOpen: blocker.state === 'blocked' || (isCloseRequested && isDirty),
    onSave: handleSave,
    onDiscard: handleDiscard,
    onCancel: handleCancel,
  }
}
