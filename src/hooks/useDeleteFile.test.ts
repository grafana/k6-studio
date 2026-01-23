import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { useNavigate } from 'react-router-dom'
import { vi, beforeEach, describe, it, expect } from 'vitest'

import { getRoutePath } from '@/routeMap'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'

import { useDeleteFile } from './useDeleteFile'

vi.mock('react-router-dom', () => ({ useNavigate: vi.fn() }))
vi.mock('@/store/ui/useToast', () => ({ useToast: vi.fn() }))
vi.mock('@/routeMap', () => ({ getRoutePath: vi.fn() }))

describe('useDeleteFile', () => {
  const navigate = vi.fn()
  const showToast = vi.fn()
  const file: StudioFile = {
    type: 'recording',
    fileName: 'file-name',
    displayName: 'test-file',
    filePath: 'file-name',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNavigate).mockReturnValue(navigate)
    vi.mocked(useToast).mockReturnValue(showToast)
    vi.stubGlobal('studio', {
      ui: { deleteFile: vi.fn().mockResolvedValue(undefined) },
    })
    vi.mocked(getRoutePath).mockReturnValue('/home')
  })

  it('should show success toast when recording deletion succeeds', async () => {
    const { result } = renderHook(() =>
      useDeleteFile({ file, navigateHomeOnDelete: false })
    )

    await act(async () => {
      await result.current()
    })

    expect(window.studio.ui.deleteFile).toHaveBeenCalledWith(file)
    expect(showToast).toHaveBeenCalledWith({
      title: 'Recording deleted',
      description: 'test-file',
      status: 'success',
    })
    expect(navigate).not.toHaveBeenCalled()
  })

  it('should navigate home when navigateHomeOnDelete is true', async () => {
    const { result } = renderHook(() =>
      useDeleteFile({ file, navigateHomeOnDelete: true })
    )

    await act(async () => {
      await result.current()
    })

    expect(navigate).toHaveBeenCalledWith('/home')
  })

  it('should show error toast when recording deletion fails', async () => {
    const error = new Error('delete failed')
    window.studio.ui.deleteFile = vi.fn().mockRejectedValue(error)

    const { result } = renderHook(() =>
      useDeleteFile({ file, navigateHomeOnDelete: false })
    )

    await act(async () => {
      await result.current()
    })

    expect(showToast).toHaveBeenCalledWith({
      title: 'Failed to delete recording',
      description: 'test-file',
      status: 'error',
    })
  })
})
