import { useStudioUIStore } from '@/store/ui'
import { orderBy } from 'lodash-es'
import { useEffect } from 'react'

export function useFolderContent() {
  const recordings = useStudioUIStore((s) => orderBy(s.recordings))
  const generators = useStudioUIStore((s) => orderBy(s.generators))
  const scripts = useStudioUIStore((s) => orderBy(s.scripts))
  const addFile = useStudioUIStore((s) => s.addFile)
  const removeFile = useStudioUIStore((s) => s.removeFile)
  const setFolderContent = useStudioUIStore((s) => s.setFolderContent)

  useEffect(() => {
    ;(async () => {
      const folderContent = await window.studio.ui.getFiles()
      setFolderContent(folderContent)
    })()
  }, [setFolderContent])

  useEffect(
    () =>
      window.studio.ui.onAddFile((path) => {
        addFile(path)
      }),
    [addFile]
  )

  useEffect(
    () =>
      window.studio.ui.onRemoveFile((path) => {
        removeFile(path)
      }),
    [removeFile]
  )

  return {
    recordings,
    generators,
    scripts,
  }
}
