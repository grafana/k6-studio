import { Button } from '@radix-ui/themes'
import log from 'electron-log/renderer'
import { useNavigate } from 'react-router-dom'

import { FileTypeToLabel } from '@/constants/files'
import { getRoutePath } from '@/routeMap'
import { usePendingDeletesStore } from '@/store/ui/usePendingDeletes'
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
  const addPending = usePendingDeletesStore((state) => state.add)
  const removePending = usePendingDeletesStore((state) => state.remove)

  return () => {
    if (usePendingDeletesStore.getState().paths.has(file.path)) {
      return
    }
    addPending(file.path)

    if (navigateHomeOnDelete) {
      navigate(getRoutePath('home'))
    }

    let undone = false

    const handleUndo = () => {
      undone = true
      removePending(file.path)
    }

    const handleDismiss = async () => {
      if (undone) {
        return
      }
      try {
        await window.studio.ui.trashFile(file)
        // pending cleared by chokidar's onRemoveFile listener atomically
        // with FolderContent removal. Clearing here creates a render
        // frame where the file briefly reappears in the sidebar.
      } catch (error) {
        log.error(error)
        showToast({
          title: `Failed to move ${FileTypeToLabel[file.type]} to Trash`,
          description: file.displayName,
          status: 'error',
        })
        removePending(file.path)
      }
    }

    showToast({
      title: 'Moved to Trash',
      description: file.displayName,
      status: 'success',
      action: (
        <Button size="1" variant="soft" onClick={handleUndo}>
          Undo
        </Button>
      ),
      onDismiss: handleDismiss,
    })
  }
}
