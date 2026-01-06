import { useNavigate } from 'react-router-dom'

import { getRoutePath } from '@/routeMap'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'

const FileTypeToLabel: Record<StudioFile['type'], string> = {
  recording: 'Recording',
  generator: 'Generator',
  script: 'Script',
  'data-file': 'Data file',
}

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

  const deleteFile = async () => {
    try {
      await window.studio.ui.deleteFile(file)
      showToast({
        title: `${FileTypeToLabel[file.type]} deleted`,
        description: file.displayName,
        status: 'success',
      })
      if (navigateHomeOnDelete) {
        navigate(getRoutePath('home'))
      }
    } catch (error) {
      showToast({
        title: 'Failed to delete file',
        description: file.displayName,
        status: 'error',
      })
    }
  }

  return deleteFile
}
