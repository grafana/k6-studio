import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { useActiveFilePath } from '@/hooks/useCurrentFile'
import { getViewPath } from '@/routeMap'
import { useStudioUIStore } from '@/store/ui'
import { StudioFile } from '@/types'
import * as path from '@/utils/path'

export type OnReferenced = 'block' | 'update' | 'force'

export interface RenameFileVariables {
  newName: string
  onReferenced?: OnReferenced
}

interface RenamedResult {
  renamed: true
}

interface NotRenamedResult {
  renamed: false
  references: string[]
}

export type RenameFileResult = RenamedResult | NotRenamedResult

export function useRenameFile(file: StudioFile) {
  const activeFilePath = useActiveFilePath()

  const navigate = useNavigate()
  const addFile = useStudioUIStore((state) => state.addFile)
  const removeFile = useStudioUIStore((state) => state.removeFile)

  return useMutation({
    mutationFn: async ({
      newName,
      onReferenced = 'block',
    }: RenameFileVariables): Promise<RenameFileResult> => {
      if (onReferenced !== 'force') {
        const { referencedBy } =
          await window.studio.workspace.getFileReferences(file.path)

        if (referencedBy.length > 0) {
          if (onReferenced === 'update') {
            throw new Error('onReferenced: update is not yet implemented')
          }

          return { renamed: false, references: referencedBy }
        }
      }

      await window.studio.ui.renameFile(file, newName)

      return { renamed: true }
    },
    onSuccess: (result, { newName }) => {
      if (!result.renamed) {
        return
      }

      // There's a slight delay between the add and remove callbacks being triggered,
      // causing the UI to flicker because it thinks the renamed file is actually
      // a new file. To prevent this, we optimistically update the file list.
      const newPath = path.join(path.dirname(file.path), newName)
      const updatedFile = {
        ...file,
        path: newPath,
        displayName: path.name(newName),
        fileName: newName,
      }

      removeFile(file)
      addFile(updatedFile)

      if (
        activeFilePath === undefined ||
        !path.equal(activeFilePath, file.path)
      ) {
        return
      }

      navigate(getViewPath(newPath), { replace: true })
    },
  })
}
