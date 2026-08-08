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
  const getFileReferences = vi.fn()
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
    getFileReferences.mockResolvedValue({ references: [], referencedBy: [] })
    vi.stubGlobal('studio', {
      ui: { trashFile },
      workspace: { getFileReferences },
    })
    usePendingDeletesStore.setState({ paths: new Set() })
  })

  function lastToast() {
    return showToast.mock.calls.at(-1)![0]
  }

  it('marks the file as pending and shows "Moved to Trash" with Undo', async () => {
    const { result } = renderHook(() =>
      useDeleteFile({ file, navigateHomeOnDelete: false })
    )

    await act(async () => {
      await result.current()
    })

    expect(usePendingDeletesStore.getState().paths.has(file.path)).toBe(true)
    expect(lastToast()).toMatchObject({
      title: 'Moved to Trash',
      description: 'test-file',
    })
    expect(isValidElement(lastToast().action)).toBe(true)
  })

  it('navigates home when navigateHomeOnDelete is true', async () => {
    const { result } = renderHook(() =>
      useDeleteFile({ file, navigateHomeOnDelete: true })
    )

    await act(async () => {
      await result.current()
    })

    expect(navigate).toHaveBeenCalledWith('/home')
  })

  it('clicking Undo removes pending and does not call trashFile', async () => {
    const { result } = renderHook(() =>
      useDeleteFile({ file, navigateHomeOnDelete: false })
    )

    await act(async () => {
      await result.current()
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

    await act(async () => {
      await result.current()
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

    await act(async () => {
      await result.current()
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

  it('second delete while file is already pending is a no-op', async () => {
    const { result } = renderHook(() =>
      useDeleteFile({ file, navigateHomeOnDelete: false })
    )

    await act(async () => {
      await result.current()
    })

    await act(async () => {
      await result.current()
    })

    expect(showToast).toHaveBeenCalledTimes(1)
  })

  it('returns references without deleting when file is in use', async () => {
    getFileReferences.mockResolvedValue({
      references: [],
      referencedBy: ['/generators/foo.k6g'],
    })

    const { result } = renderHook(() =>
      useDeleteFile({ file, navigateHomeOnDelete: false })
    )

    let deleteResult
    await act(async () => {
      deleteResult = await result.current()
    })

    expect(deleteResult).toEqual({
      deleted: false,
      references: ['/generators/foo.k6g'],
    })
    expect(showToast).not.toHaveBeenCalled()
  })

  it('force:true bypasses the reference check and deletes immediately', async () => {
    getFileReferences.mockResolvedValue({
      references: [],
      referencedBy: ['/generators/foo.k6g'],
    })

    const { result } = renderHook(() =>
      useDeleteFile({ file, navigateHomeOnDelete: false })
    )

    await act(async () => {
      await result.current({ force: true })
    })

    expect(getFileReferences).not.toHaveBeenCalled()
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Moved to Trash' })
    )
  })
})
