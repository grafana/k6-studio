import { Button } from '@radix-ui/themes'
import { upperFirst } from 'lodash-es'
import { useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { FileTypeToLabel } from '@/constants/files'
import { getRoutePath } from '@/routeMap'
import { useStudioUIStore } from '@/store/ui'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'

interface UseDeleteFileArgs {
  file: StudioFile
}

export function useDeleteFile({ file }: UseDeleteFileArgs) {
  const { fileName: currentFile } = useParams()

  const navigate = useNavigate()
  const showToast = useToast()
  const addFile = useStudioUIStore((state) => state.addFile)
  const removeFile = useStudioUIStore((state) => state.removeFile)
  const cancelledRef = useRef(false)

  const deleteFile = () => {
    // Reset cancellation state for each deletion
    cancelledRef.current = false

    // 1. Optimistically remove from UI
    removeFile(file)

    // 2. If the deleted file is currently open, navigate home
    if (currentFile === file.fileName) {
      navigate(getRoutePath('home'))
    }

    // 3. Show toast with undo button
    showToast({
      title: `${upperFirst(FileTypeToLabel[file.type])} deleted`,
      description: file.displayName,
      status: 'success',
      action: <Button onClick={handleUndo}>Undo</Button>,
      onClose: handleDelete,
    })

    async function handleDelete() {
      // Don't delete if undo was clicked
      if (cancelledRef.current) {
        return
      }

      try {
        await window.studio.ui.deleteFile(file)
      } catch (error) {
        // If deletion fails, restore the file
        addFile(file)
        showToast({
          title: `Failed to delete ${FileTypeToLabel[file.type]}`,
          description: file.displayName,
          status: 'error',
        })
      }
    }

    function handleUndo() {
      // Mark as cancelled so onClose won't delete
      cancelledRef.current = true
      // Restore the file to the UI
      addFile(file)
    }
  }

  return deleteFile
}
