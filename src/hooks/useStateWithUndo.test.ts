import { renderHook, act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useStateWithUndo } from './useStateWithUndo'

describe('useStateWithUndo', () => {
  it('should initialize with the provided initial state', () => {
    const { result } = renderHook(() => useStateWithUndo(5))

    expect(result.current.state).toBe(5)
    expect(result.current.undo).toBeUndefined()
    expect(result.current.redo).toBeUndefined()
  })

  it('should update state and add to undo stack', () => {
    const { result } = renderHook(() => useStateWithUndo(1))

    act(() => {
      result.current.push(2)
    })

    expect(result.current.state).toBe(2)
    expect(result.current.undo).toBeDefined()
    expect(result.current.redo).toBeUndefined()
  })

  it('should undo to previous state', () => {
    const { result } = renderHook(() => useStateWithUndo(1))

    act(() => {
      result.current.push(2)
    })

    act(() => {
      result.current.undo?.()
    })

    expect(result.current.state).toBe(1)
    expect(result.current.undo).toBeUndefined()
    expect(result.current.redo).toBeDefined()
  })

  it('should redo to next state', () => {
    const { result } = renderHook(() => useStateWithUndo(1))

    act(() => {
      result.current.push(2)
    })

    act(() => {
      result.current.undo?.()
    })

    act(() => {
      result.current.redo?.()
    })

    expect(result.current.state).toBe(2)
    expect(result.current.undo).toBeDefined()
    expect(result.current.redo).toBeUndefined()
  })

  it('should handle multiple undo operations', () => {
    const { result } = renderHook(() => useStateWithUndo(1))

    act(() => {
      result.current.push(2)
    })

    act(() => {
      result.current.push(3)
    })

    act(() => {
      result.current.push(4)
    })

    expect(result.current.state).toBe(4)

    act(() => {
      result.current.undo?.()
    })

    expect(result.current.state).toBe(3)

    act(() => {
      result.current.undo?.()
    })

    expect(result.current.state).toBe(2)

    act(() => {
      result.current.undo?.()
    })

    expect(result.current.state).toBe(1)
    expect(result.current.undo).toBeUndefined()
  })

  it('should handle multiple redo operations', () => {
    const { result } = renderHook(() => useStateWithUndo(1))

    act(() => {
      result.current.push(2)
    })

    act(() => {
      result.current.push(3)
    })

    act(() => {
      result.current.undo?.()
    })

    act(() => {
      result.current.undo?.()
    })

    expect(result.current.state).toBe(1)

    act(() => {
      result.current.redo?.()
    })

    expect(result.current.state).toBe(2)

    act(() => {
      result.current.redo?.()
    })

    expect(result.current.state).toBe(3)
    expect(result.current.redo).toBeUndefined()
  })

  it('should clear redo stack when pushing new state after undo', () => {
    const { result } = renderHook(() => useStateWithUndo(1))

    act(() => {
      result.current.push(2)
    })

    act(() => {
      result.current.push(3)
    })

    act(() => {
      result.current.undo?.()
    })

    expect(result.current.state).toBe(2)
    expect(result.current.redo).toBeDefined()

    act(() => {
      result.current.push(4)
    })

    expect(result.current.state).toBe(4)
    expect(result.current.redo).toBeUndefined()
  })

  it('should reset state and clear both stacks', () => {
    const { result } = renderHook(() => useStateWithUndo(1))

    act(() => {
      result.current.push(2)
    })

    act(() => {
      result.current.push(3)
    })

    act(() => {
      result.current.undo?.()
    })

    expect(result.current.undo).toBeDefined()
    expect(result.current.redo).toBeDefined()

    act(() => {
      result.current.reset(10)
    })

    expect(result.current.state).toBe(10)
    expect(result.current.undo).toBeUndefined()
    expect(result.current.redo).toBeUndefined()
  })

  it('should work with complex object types', () => {
    interface ComplexState {
      id: number
      name: string
      nested: { value: number }
    }

    const initialState: ComplexState = {
      id: 1,
      name: 'test',
      nested: { value: 10 },
    }

    const { result } = renderHook(() => useStateWithUndo(initialState))

    const newState: ComplexState = {
      id: 2,
      name: 'updated',
      nested: { value: 20 },
    }

    act(() => {
      result.current.push(newState)
    })

    expect(result.current.state).toEqual(newState)

    act(() => {
      result.current.undo?.()
    })

    expect(result.current.state).toEqual(initialState)
  })

  it('should work with array types', () => {
    const { result } = renderHook(() => useStateWithUndo<number[]>([1, 2, 3]))

    act(() => {
      result.current.push([1, 2, 3, 4])
    })

    expect(result.current.state).toEqual([1, 2, 3, 4])

    act(() => {
      result.current.undo?.()
    })

    expect(result.current.state).toEqual([1, 2, 3])
  })

  it('should not do anything when undo is called with empty undo stack', () => {
    const { result } = renderHook(() => useStateWithUndo(5))

    const initialState = result.current.state

    act(() => {
      result.current.undo?.()
    })

    expect(result.current.state).toBe(initialState)
  })

  it('should not do anything when redo is called with empty redo stack', () => {
    const { result } = renderHook(() => useStateWithUndo(5))

    act(() => {
      result.current.push(10)
    })

    const currentState = result.current.state

    act(() => {
      result.current.redo?.()
    })

    expect(result.current.state).toBe(currentState)
  })
})
