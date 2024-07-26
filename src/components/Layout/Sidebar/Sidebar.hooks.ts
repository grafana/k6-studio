import { useStudioUIStore } from '@/store/ui'
import { useEffect } from 'react'

export function useFolderContent() {
  const recordings = useStudioUIStore((s) => s.recordings)
  const generators = useStudioUIStore((s) => s.generators)
  const scripts = useStudioUIStore((s) => s.scripts)
  const addFile = useStudioUIStore((s) => s.addFile)
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

  return {
    recordings,
    generators,
    scripts,
  }
}
