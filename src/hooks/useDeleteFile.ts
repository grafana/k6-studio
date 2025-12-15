import { useNavigate } from 'react-router-dom'

import { getRoutePath } from '@/routeMap'
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

  const deleteFile = async () => {
    try {
      await window.studio.ui.deleteFile(file)
      showToast({
        title: `${file.type} deleted`,
        description: file.displayName,
        status: 'success',
      })
      if (navigateHomeOnDelete) {
        navigate(getRoutePath('home'))
      }
    } catch (error) {
      console.error('Failed to delete file', error)
      showToast({
        title: 'Failed to delete file',
        description: file.displayName,
        status: 'error',
      })
    }
  }

  return deleteFile
}
