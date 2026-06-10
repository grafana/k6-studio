import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { UpdateFileReferencesResult } from '@/handlers/workspace/types'
import { useActiveFilePath } from '@/hooks/useCurrentFile'
import { getViewPath } from '@/routeMap'
import { useStudioUIStore } from '@/store/ui'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'
import * as path from '@/utils/path'

export type OnReferenced = 'block' | 'update' | 'force'

export interface RenameFileVariables {
  newName: string
  onReferenced?: OnReferenced
}

interface RenamedResult {
  renamed: true
  updateResult?: UpdateFileReferencesResult
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
  const showToast = useToast()

  return useMutation({
    mutationFn: async ({
      newName,
      onReferenced = 'block',
    }: RenameFileVariables): Promise<RenameFileResult> => {
      if (onReferenced === 'force') {
        await window.studio.ui.renameFile(file, newName)

        return {
          renamed: true,
        }
      }

      const { referencedBy } = await window.studio.workspace.getFileReferences(
        file.path
      )

      if (referencedBy.length === 0) {
        await window.studio.ui.renameFile(file, newName)

        return {
          renamed: true,
        }
      }

      if (onReferenced === 'block') {
        return {
          renamed: false,
          references: referencedBy,
        }
      }

      // We do the file rename first because that might fail because a file with the new name might
      // already exist. There's also a possibility that that we succeed in renaming the file but fail
      // to update the references and, in that case, it's better that we notify the user and leave
      // the file renamed. This is a convenience feature after all.
      await window.studio.ui.renameFile(file, newName)

      const updateResult = await window.studio.workspace.updateFileReferences({
        oldPath: file.path,
        newPath: path.join(path.dirname(file.path), newName),
        referencingFiles: referencedBy,
      })

      return {
        renamed: true,
        updateResult,
      }
    },
    onSuccess: (result, { newName }) => {
      if (!result.renamed) {
        return
      }

      if (result.updateResult) {
        const { updated, failed } = result.updateResult

        if (failed > 0) {
          showToast({
            title: `Updated ${updated} references. ${failed} failed. See logs for details.`,
            status: 'error',
          })
        } else {
          showToast({
            title: `Updated references in ${updated} files`,
            status: 'success',
          })
        }
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
