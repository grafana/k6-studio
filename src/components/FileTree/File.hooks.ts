import { useStudioUIStore } from '@/store/ui'
import { StudioFile } from '@/types'
import { getFileNameWithoutExtension } from '@/utils/file'
import { useMutation } from '@tanstack/react-query'

export function useRenameFile(file: StudioFile) {
  const addFile = useStudioUIStore((state) => state.addFile)
  const removeFile = useStudioUIStore((state) => state.removeFile)

  return useMutation({
    mutationFn: (newName: string) =>
      window.studio.ui.renameFile(file.fileName, newName, file.type),
    onMutate: (newName: string) => {
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

      return { updatedFile }
    },
    onError: (_, __, context) => {
      if (!context) {
        return
      }

      // Rollback the optimistic update
      removeFile(context.updatedFile)
      addFile(file)
    },
  })
}
