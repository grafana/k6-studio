import { useMutation } from '@tanstack/react-query'
import { dirname, join, parse } from 'pathe'
import { useNavigate } from 'react-router-dom'

import { useActiveFilePath } from '@/hooks/useCurrentFile'
import { getViewPath } from '@/routeMap'
import { useStudioUIStore } from '@/store/ui'
import { StudioFile } from '@/types'
import { queryClient } from '@/utils/query'

export function useRenameFile(file: StudioFile) {
  const activeFilePath = useActiveFilePath()

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
      const newPath = join(dirname(file.path), newName)
      const updatedFile = {
        ...file,
        path: newPath,
        displayName: parse(newName).name,
        fileName: newName,
      }

      removeFile(file)
      addFile(updatedFile)

      if (activeFilePath !== file.path) {
        return
      }

      if (file.type === 'generator') {
        queryClient.setQueryData(
          ['generator', newName],
          queryClient.getQueryData(['generator', file.fileName])
        )
      }

      navigate(getViewPath(file.type, newPath), { replace: true })
    },
  })
}
