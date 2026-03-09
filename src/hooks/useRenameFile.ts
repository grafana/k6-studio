import { useMutation } from '@tanstack/react-query'
import * as pathe from 'pathe'
import { useNavigate, useParams } from 'react-router-dom'

import { useStudioUIStore } from '@/store/ui'
import { StudioFile } from '@/types'
import { getFileNameWithoutExtension, getViewPath } from '@/utils/file'
import { queryClient } from '@/utils/query'

export function useRenameFile(file: StudioFile) {
  // We don't want to use the useFileNameParam hook here because we might be in
  // a view that doesn't have a file name parameter e.g. the home page.
  const { path: currentPath } = useParams<{ path?: string }>()

  const navigate = useNavigate()
  const addFile = useStudioUIStore((state) => state.addFile)
  const removeFile = useStudioUIStore((state) => state.removeFile)

  return useMutation({
    mutationFn: (newName: string) =>
      window.studio.ui.renameFile(file.path, newName),
    onSuccess: (_, newName) => {
      const newPath = pathe.join(pathe.dirname(file.path), newName)
      const updatedFile: StudioFile = {
        ...file,
        path: newPath,
        displayName: getFileNameWithoutExtension(newName),
        fileName: newName,
      }

      removeFile(file)
      addFile(updatedFile)

      if (
        currentPath === undefined ||
        decodeURIComponent(currentPath) !== file.path
      ) {
        return
      }

      if (file.type === 'generator') {
        queryClient.setQueryData(
          ['generator', newPath],
          queryClient.getQueryData(['generator', file.path])
        )
      }

      navigate(getViewPath(newPath), { replace: true })
    },
  })
}
