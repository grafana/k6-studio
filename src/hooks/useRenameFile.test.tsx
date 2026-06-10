import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'
import { useNavigate } from 'react-router-dom'
import { vi, beforeEach, describe, it, expect } from 'vitest'

import { useActiveFilePath } from '@/hooks/useCurrentFile'
import { useStudioUIStore } from '@/store/ui'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'
import { AddToastPayload } from '@/types/toast'

import { useRenameFile } from './useRenameFile'

vi.mock('react-router-dom', () => ({ useNavigate: vi.fn() }))
vi.mock('@/store/ui/useToast', () => ({ useToast: vi.fn() }))
vi.mock('@/hooks/useCurrentFile', () => ({ useActiveFilePath: vi.fn() }))

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

describe('useRenameFile', () => {
  const navigate = vi.fn()
  const showToast = vi.fn<(payload: AddToastPayload) => void>()
  const renameFile = vi.fn()
  const getFileReferences = vi.fn()
  const updateFileReferences = vi.fn()

  const file: StudioFile = {
    type: 'recording',
    fileName: 'recording.har',
    displayName: 'recording',
    path: '/recordings/recording.har',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNavigate).mockReturnValue(navigate)
    vi.mocked(useToast).mockReturnValue(showToast)
    vi.mocked(useActiveFilePath).mockReturnValue(undefined)
    renameFile.mockResolvedValue(undefined)
    getFileReferences.mockResolvedValue({ references: [], referencedBy: [] })
    updateFileReferences.mockResolvedValue({ updated: 0, failed: 0 })
    vi.stubGlobal('studio', {
      ui: { renameFile },
      workspace: { getFileReferences, updateFileReferences },
    })
    useStudioUIStore.setState({
      recordings: new Map(),
      generators: new Map(),
      scripts: new Map(),
      dataFiles: new Map(),
      browserTests: new Map(),
    })
  })

  describe('force', () => {
    it('skips the reference check and renames directly', async () => {
      const { result } = renderHook(() => useRenameFile(file), {
        wrapper: createWrapper(),
      })

      let renameResult
      await act(async () => {
        renameResult = await result.current.mutateAsync({
          newName: 'new-recording.har',
          onReferenced: 'force',
        })
      })

      expect(getFileReferences).not.toHaveBeenCalled()
      expect(renameFile).toHaveBeenCalledWith(file, 'new-recording.har')
      expect(renameResult).toEqual({ renamed: true })
    })

    it('updates the file list on success', async () => {
      const { result } = renderHook(() => useRenameFile(file), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.mutateAsync({
          newName: 'new-recording.har',
          onReferenced: 'force',
        })
      })

      const { recordings } = useStudioUIStore.getState()
      expect(recordings.has('/recordings/recording.har')).toBe(false)
      expect(recordings.has('/recordings/new-recording.har')).toBe(true)
    })
  })

  describe('block', () => {
    it('renames directly when there are no references', async () => {
      const { result } = renderHook(() => useRenameFile(file), {
        wrapper: createWrapper(),
      })

      let renameResult
      await act(async () => {
        renameResult = await result.current.mutateAsync({
          newName: 'new-recording.har',
        })
      })

      expect(getFileReferences).toHaveBeenCalledWith(file.path)
      expect(renameFile).toHaveBeenCalledWith(file, 'new-recording.har')
      expect(renameResult).toEqual({ renamed: true })
    })

    it('returns references without renaming when the file is in use', async () => {
      getFileReferences.mockResolvedValue({
        references: [],
        referencedBy: ['/generators/gen.k6g'],
      })

      const { result } = renderHook(() => useRenameFile(file), {
        wrapper: createWrapper(),
      })

      let renameResult
      await act(async () => {
        renameResult = await result.current.mutateAsync({
          newName: 'new-recording.har',
        })
      })

      expect(renameFile).not.toHaveBeenCalled()
      expect(renameResult).toEqual({
        renamed: false,
        references: ['/generators/gen.k6g'],
      })
    })
  })

  describe('update', () => {
    const referencedBy = ['/generators/gen1.k6g', '/generators/gen2.k6g']

    beforeEach(() => {
      getFileReferences.mockResolvedValue({ references: [], referencedBy })
      updateFileReferences.mockResolvedValue({ updated: 2, failed: 0 })
    })

    it('renames the file first then updates references', async () => {
      const callOrder: string[] = []
      renameFile.mockImplementation(() => {
        callOrder.push('rename')
        return Promise.resolve()
      })
      updateFileReferences.mockImplementation(() => {
        callOrder.push('update')
        return Promise.resolve({ updated: 2, failed: 0 })
      })

      const { result } = renderHook(() => useRenameFile(file), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.mutateAsync({
          newName: 'new-recording.har',
          onReferenced: 'update',
        })
      })

      expect(callOrder).toEqual(['rename', 'update'])
    })

    it('passes old path, new path, and referencing files to the update handler', async () => {
      const { result } = renderHook(() => useRenameFile(file), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.mutateAsync({
          newName: 'new-recording.har',
          onReferenced: 'update',
        })
      })

      expect(updateFileReferences).toHaveBeenCalledWith({
        oldPath: '/recordings/recording.har',
        newPath: '/recordings/new-recording.har',
        referencingFiles: referencedBy,
      })
    })

    it('shows a success toast when all references are updated', async () => {
      const { result } = renderHook(() => useRenameFile(file), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.mutateAsync({
          newName: 'new-recording.har',
          onReferenced: 'update',
        })
      })

      expect(showToast).toHaveBeenCalledWith({
        title: 'Updated references in 2 files',
        status: 'success',
      })
    })

    it('shows an error toast when some references failed to update', async () => {
      updateFileReferences.mockResolvedValue({ updated: 1, failed: 1 })

      const { result } = renderHook(() => useRenameFile(file), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.mutateAsync({
          newName: 'new-recording.har',
          onReferenced: 'update',
        })
      })

      expect(showToast).toHaveBeenCalledWith({
        title: 'Updated 1 references. 1 failed. See logs for details.',
        status: 'error',
      })
    })

    it('renames the file even when there are no references', async () => {
      getFileReferences.mockResolvedValue({ references: [], referencedBy: [] })

      const { result } = renderHook(() => useRenameFile(file), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.mutateAsync({
          newName: 'new-recording.har',
          onReferenced: 'update',
        })
      })

      expect(renameFile).toHaveBeenCalledWith(file, 'new-recording.har')
      expect(updateFileReferences).not.toHaveBeenCalled()
    })
  })
})
