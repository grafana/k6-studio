import { renderHook, render, fireEvent, act } from '@testing-library/react'
import { isValidElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { vi, beforeEach, describe, it, expect } from 'vitest'

import { getRoutePath } from '@/routeMap'
import { usePendingDeletesStore } from '@/store/ui/usePendingDeletes'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'
import { AddToastPayload } from '@/types/toast'

import { useDeleteFile } from './useDeleteFile'

vi.mock('react-router-dom', () => ({ useNavigate: vi.fn() }))
vi.mock('@/store/ui/useToast', () => ({ useToast: vi.fn() }))
vi.mock('@/routeMap', () => ({ getRoutePath: vi.fn() }))

describe('useDeleteFile', () => {
  const navigate = vi.fn()
  const showToast = vi.fn<(payload: AddToastPayload) => void>()
  const trashFile = vi.fn()
  const file: StudioFile = {
    type: 'recording',
    fileName: 'file-name.har',
    displayName: 'test-file',
    path: '/recordings/file-name.har',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNavigate).mockReturnValue(navigate)
    vi.mocked(useToast).mockReturnValue(showToast)
    vi.mocked(getRoutePath).mockReturnValue('/home')
    trashFile.mockResolvedValue(undefined)
    vi.stubGlobal('studio', { ui: { trashFile } })
    usePendingDeletesStore.setState({ paths: new Set() })
  })

  function lastToast() {
    return showToast.mock.calls.at(-1)![0]
  }

  it('marks the file as pending and shows "Moved to Trash" with Undo', () => {
    const { result } = renderHook(() =>
      useDeleteFile({ file, navigateHomeOnDelete: false })
    )

    act(() => {
      result.current()
    })

    expect(usePendingDeletesStore.getState().paths.has(file.path)).toBe(true)
    expect(lastToast()).toMatchObject({
      title: 'Moved to Trash',
      description: 'test-file',
    })
    expect(isValidElement(lastToast().action)).toBe(true)
  })

  it('navigates home when navigateHomeOnDelete is true', () => {
    const { result } = renderHook(() =>
      useDeleteFile({ file, navigateHomeOnDelete: true })
    )

    act(() => {
      result.current()
    })

    expect(navigate).toHaveBeenCalledWith('/home')
  })

  it('clicking Undo removes pending and does not call trashFile', async () => {
    const { result } = renderHook(() =>
      useDeleteFile({ file, navigateHomeOnDelete: false })
    )

    act(() => {
      result.current()
    })

    const action = lastToast().action
    const rendered = render(<>{action}</>)

    act(() => {
      fireEvent.click(rendered.getByRole('button', { name: /undo/i }))
    })

    expect(usePendingDeletesStore.getState().paths.has(file.path)).toBe(false)

    const onDismiss = lastToast().onDismiss
    await act(async () => {
      await Promise.resolve(onDismiss?.())
    })

    expect(trashFile).not.toHaveBeenCalled()
  })

  it('toast dismiss without Undo calls trashFile; pending stays for chokidar to clear', async () => {
    const { result } = renderHook(() =>
      useDeleteFile({ file, navigateHomeOnDelete: false })
    )

    act(() => {
      result.current()
    })

    const onDismiss = lastToast().onDismiss
    await act(async () => {
      await Promise.resolve(onDismiss?.())
    })

    expect(trashFile).toHaveBeenCalledWith(file)
    expect(usePendingDeletesStore.getState().paths.has(file.path)).toBe(true)
  })

  it('trashFile failure surfaces an error toast and clears pending', async () => {
    trashFile.mockRejectedValueOnce(new Error('boom'))
    const { result } = renderHook(() =>
      useDeleteFile({ file, navigateHomeOnDelete: false })
    )

    act(() => {
      result.current()
    })

    const onDismiss = lastToast().onDismiss
    await act(async () => {
      await Promise.resolve(onDismiss?.())
    })

    expect(showToast).toHaveBeenLastCalledWith({
      title: 'Failed to move recording to Trash',
      description: 'test-file',
      status: 'error',
    })
    expect(usePendingDeletesStore.getState().paths.has(file.path)).toBe(false)
  })

  it('double-click on the same file is deduped', () => {
    const { result } = renderHook(() =>
      useDeleteFile({ file, navigateHomeOnDelete: false })
    )

    act(() => {
      result.current()
      result.current()
    })

    expect(showToast).toHaveBeenCalledTimes(1)
  })

  it('accepts custom toast title and runs onUndo after Undo', () => {
    const onUndo = vi.fn()
    const { result } = renderHook(() =>
      useDeleteFile({ file, navigateHomeOnDelete: false })
    )

    act(() => {
      result.current({ toastTitle: 'Recording discarded', onUndo })
    })

    expect(lastToast()).toMatchObject({
      title: 'Recording discarded',
      description: 'test-file',
    })

    const action = lastToast().action
    const rendered = render(<>{action}</>)

    act(() => {
      fireEvent.click(rendered.getByRole('button', { name: /undo/i }))
    })

    expect(onUndo).toHaveBeenCalledTimes(1)
  })
})
