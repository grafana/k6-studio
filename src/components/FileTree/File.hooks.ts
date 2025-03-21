import { useMutation } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'

import { useStudioUIStore } from '@/store/ui'
import { StudioFile } from '@/types'
import { getFileNameWithoutExtension, getViewPath } from '@/utils/file'
import { queryClient } from '@/utils/query'

export function useRenameFile(file: StudioFile) {
  const { fileName: selectedFileName } = useParams()
  const navigate = useNavigate()
  const addFile = useStudioUIStore((state) => state.addFile)
  const removeFile = useStudioUIStore((state) => state.removeFile)

  return useMutation({
    mutationFn: (newName: string) =>
      window.studio.ui.renameFile(file.fileName, newName, file.type),
    onSuccess: (_, newName) => {
      // There's a slight delay between the add and remove callbacks being triggered,
      // causing the UI to flicker because it thinks the renamed file is actually
      // a new file. To prevent this, we optimistically update the file list.
      const updatedFile = {
        ...file,
        displayName: getFileNameWithoutExtension(newName),
        fileName: newName,
      }

      removeFile(file)
      addFile(updatedFile)

      if (selectedFileName !== file.fileName) {
        return
      }

      if (file.type === 'generator') {
        queryClient.setQueryData(
          ['generator', newName],
          queryClient.getQueryData(['generator', file.fileName])
        )
      }

      navigate(getViewPath(file.type, newName), { replace: true })
    },
  })
}
