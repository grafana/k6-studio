import { useEffect, useMemo } from 'react'

import { useStateWithUndo } from '@/hooks/useStateWithUndo'
import { AnyBrowserAction } from '@/main/runner/schema'
import { BrowserTestFile } from '@/schemas/browserTest/v1'

import { BrowserActionWithId } from './types'

export function useBrowserTestState(
  browserTestFile: BrowserTestFile | undefined
) {
  const { actions = [] } = browserTestFile ?? {}
  const { state, undo, redo, push, reset } = useStateWithUndo<
    BrowserActionWithId[]
  >(
    actions.map((action) => ({
      id: crypto.randomUUID(),
      action,
    }))
  )

  useEffect(() => {
    reset(
      actions.map((action) => ({
        id: crypto.randomUUID(),
        action,
      }))
    )
  }, [reset, actions])

  const addAction = (action: BrowserActionWithId) => {
    push([...state, action])
  }

  const updateAction = (updatedAction: BrowserActionWithId) => {
    const newActions = state.map((action) =>
      action.id === updatedAction.id ? updatedAction : action
    )
    push(newActions)
  }

  const removeAction = (id: string) => {
    const newActions = state.filter((actionWithId) => actionWithId.id !== id)
    push(newActions)
  }

  const resetActions = (newState: AnyBrowserAction[]) => {
    reset(
      newState.map((action) => ({
        id: crypto.randomUUID(),
        action,
      }))
    )
  }

  const plainActions = useMemo(() => {
    return state.map((actionWithId) => actionWithId.action)
  }, [state])

  const isDirty = useMemo(() => {
    return (
      plainActions.length !== actions.length ||
      JSON.stringify(plainActions) !== JSON.stringify(actions)
    )
  }, [plainActions, actions])

  return {
    actions: state,
    plainActions,
    addAction,
    updateAction,
    removeAction,
    isDirty,
    undo,
    redo,
    resetActions,
  }
}
