import { useEffect, useState } from 'react'
import { useBlocker } from 'react-router-dom'

interface UseUnsavedChangesPromptOptions {
  isDirty: boolean
  onSave: () => Promise<unknown>
}

export function useUnsavedChangesPrompt({
  isDirty,
  onSave,
}: UseUnsavedChangesPromptOptions) {
  const [isAppClosing, setIsAppClosing] = useState(false)

  const blocker = useBlocker(({ historyAction }) => {
    // Don't block navigation when redirecting (e.g. away from an invalid file)
    // TODO(router): Action enum is not exported from react-router-dom
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    return isDirty && historyAction !== 'REPLACE'
  })

  useEffect(() => {
    return window.studio.app.onApplicationClose(() => {
      if (isDirty || blocker.state === 'blocked') {
        setIsAppClosing(true)
        return
      }
      window.studio.app.closeApplication()
    })
  })

  const handleSave = async () => {
    const result = await onSave()

    if (result === undefined) {
      setIsAppClosing(false)

      return
    }

    if (isAppClosing) {
      return window.studio.app.closeApplication()
    }

    blocker.proceed?.()
  }

  const handleDiscard = () => {
    if (isAppClosing) {
      return window.studio.app.closeApplication()
    }

    blocker.proceed?.()
  }

  const handleCancel = () => {
    setIsAppClosing(false)
    blocker.reset?.()
  }

  return {
    isOpen: blocker.state === 'blocked' || (isAppClosing && isDirty),
    onSave: handleSave,
    onDiscard: handleDiscard,
    onCancel: handleCancel,
  }
}
