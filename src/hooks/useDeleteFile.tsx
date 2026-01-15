import { Button } from '@radix-ui/themes'
import { upperFirst } from 'lodash-es'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { FileTypeToLabel } from '@/constants/files'
import { TOAST_DURATION_MS } from '@/constants/ui'
import { getRoutePath } from '@/routeMap'
import { useStudioUIStore } from '@/store/ui'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'

interface UseDeleteFileArgs {
  file: StudioFile
  navigateHomeOnDelete?: boolean
}

export function useDeleteFile({
  file,
  navigateHomeOnDelete,
}: UseDeleteFileArgs) {
  const navigate = useNavigate()
  const showToast = useToast()
  const addFile = useStudioUIStore((state) => state.addFile)
  const removeFile = useStudioUIStore((state) => state.removeFile)
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const deleteFile = () => {
    const performDelete = async () => {
      await window.studio.ui.deleteFile(file)
    }

    const handleUndo = () => {
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current)
        deleteTimeoutRef.current = null
      }
      // Restore the file to the UI
      addFile(file)
    }

    // Optimistically remove from UI
    removeFile(file)

    // Show toast with undo button
    showToast({
      title: `${upperFirst(FileTypeToLabel[file.type])} deleted`,
      description: file.displayName,
      status: 'success',
      action: <Button onClick={handleUndo}>Undo</Button>,
    })

    if (navigateHomeOnDelete) {
      navigate(getRoutePath('home'))
    }

    // Schedule the actual deletion
    deleteTimeoutRef.current = setTimeout(async () => {
      try {
        await performDelete()
        deleteTimeoutRef.current = null
      } catch (error) {
        // If deletion fails, restore the file
        addFile(file)
        showToast({
          title: `Failed to delete ${FileTypeToLabel[file.type]}`,
          description: file.displayName,
          status: 'error',
        })
      }
    }, TOAST_DURATION_MS)
  }

  return deleteFile
}
