import { Theme } from '@radix-ui/themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { StudioFile } from '@/types'

import { FileNameHeader } from './FileNameHeader'

vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }))
vi.mock('@/hooks/useCurrentFile', () => ({
  useActiveFilePath: () => undefined,
}))

const renameFile = vi.fn()
const getFileReferences = vi.fn()
const file: StudioFile = {
  type: 'recording',
  fileName: 'recording.har',
  displayName: 'recording',
  path: '/recordings/recording.har',
}

beforeEach(() => {
  vi.clearAllMocks()
  renameFile.mockResolvedValue(undefined)
  getFileReferences.mockResolvedValue({ references: [], referencedBy: [] })
  vi.stubGlobal('studio', {
    ui: { renameFile },
    workspace: { getFileReferences },
  })
})

async function openRenameEditor() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <Theme>
        <FileNameHeader file={file} />
      </Theme>
    </QueryClientProvider>
  )
  await userEvent.click(
    screen.getByRole('button', { name: 'Rename recording' })
  )
  return screen.getByRole('textbox')
}

describe('FileNameHeader', () => {
  it('restores the draft and focus when the reference dialog is canceled', async () => {
    getFileReferences.mockResolvedValue({
      references: [],
      referencedBy: ['/generators/test.k6g'],
    })
    await openRenameEditor()
    await userEvent.clear(screen.getByRole('textbox'))
    await userEvent.type(screen.getByRole('textbox'), 'new-name')
    await userEvent.click(screen.getByRole('button', { name: 'Rename' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    const input = await screen.findByRole('textbox')
    expect(input).toHaveProperty('value', 'new-name')
    await waitFor(() => expect(document.activeElement).toBe(input))
    expect(renameFile).not.toHaveBeenCalled()
  })

  it('disables confirmation while a referenced file is being renamed', async () => {
    getFileReferences.mockResolvedValue({
      references: [],
      referencedBy: ['/generators/test.k6g'],
    })
    let finishRename: () => void = () => undefined
    renameFile.mockReturnValue(
      new Promise<void>((resolve) => {
        finishRename = resolve
      })
    )
    await openRenameEditor()
    await userEvent.type(screen.getByRole('textbox'), '-renamed')
    await userEvent.click(screen.getByRole('button', { name: 'Rename' }))
    const confirm = await screen.findByRole('button', { name: 'Rename anyway' })
    await userEvent.click(confirm)

    await waitFor(() => expect(confirm).toHaveProperty('disabled', true))
    expect(screen.getByRole('button', { name: 'Update files' })).toHaveProperty(
      'disabled',
      true
    )
    await userEvent.click(confirm)
    expect(renameFile).toHaveBeenCalledTimes(1)
    finishRename()
    await waitFor(() =>
      expect(screen.queryByText('Update references')).toBeNull()
    )
  })

  it('keeps the editor available after a failed rename and allows retrying', async () => {
    renameFile.mockRejectedValueOnce(new Error('File already exists'))
    const input = await openRenameEditor()
    await userEvent.clear(input)
    await userEvent.type(input, 'duplicate')
    await userEvent.click(screen.getByRole('button', { name: 'Rename' }))

    await waitFor(() => expect(renameFile).toHaveBeenCalledTimes(1))
    expect(screen.getByRole('textbox')).toHaveProperty('value', 'duplicate')
    await userEvent.clear(input)
    await userEvent.type(input, 'available')
    await userEvent.click(screen.getByRole('button', { name: 'Rename' }))

    await waitFor(() => expect(screen.queryByRole('textbox')).toBeNull())
    expect(renameFile).toHaveBeenLastCalledWith(file, 'available.har')
  })
})
