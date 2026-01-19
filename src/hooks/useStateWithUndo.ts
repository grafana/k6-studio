import { useCallback, useState } from 'react'

export function useStateWithUndo<T>(initialState: T) {
  const [currentState, setCurrentState] = useState(initialState)

  const [undoStack, setUndoStack] = useState<T[]>([])
  const [redoStack, setRedoStack] = useState<T[]>([])

  const setState = (value: T) => {
    setUndoStack((history) => [currentState, ...history])
    setRedoStack([])

    setCurrentState(value)
  }

  const undo = useCallback(() => {
    const [previousState, ...remaining] = undoStack

    if (previousState === undefined) {
      return
    }

    setRedoStack((history) => [currentState, ...history])
    setUndoStack(remaining)

    setCurrentState(previousState)
  }, [undoStack, currentState])

  const redo = useCallback(() => {
    const [nextState, ...remaining] = redoStack

    if (nextState === undefined) {
      return
    }

    setUndoStack((history) => [currentState, ...history])
    setRedoStack(remaining)

    setCurrentState(nextState)
  }, [redoStack, currentState])

  const reset = useCallback((newState: T) => {
    setCurrentState(newState)
    setUndoStack([])
    setRedoStack([])
  }, [])

  return {
    state: currentState,
    undo: undoStack.length > 0 ? undo : undefined,
    redo: redoStack.length > 0 ? redo : undefined,
    push: setState,
    reset,
  }
}
