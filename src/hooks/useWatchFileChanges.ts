import { useEffect } from 'react'

import { useStudioUIStore } from '@/store/ui'
import { StudioFile } from '@/types'

function toFileMap(files: StudioFile[]) {
  return new Map(files.map((file) => [file.fileName, file]))
}

export function useWatchFileChanges() {
  const addFile = useStudioUIStore((s) => s.addFile)
  const removeFile = useStudioUIStore((s) => s.removeFile)
  const setFolderContent = useStudioUIStore((s) => s.setFolderContent)

  useEffect(() => {
    ;(async () => {
      const files = await window.studio.ui.getFiles()

      setFolderContent({
        recordings: toFileMap(files.recordings),
        generators: toFileMap(files.generators),
        scripts: toFileMap(files.scripts),
        dataFiles: toFileMap(files.dataFiles),
        browserTests: toFileMap(files.browserTests),
      })
    })()
  }, [setFolderContent])

  useEffect(
    () =>
      window.studio.ui.onAddFile((file) => {
        addFile(file)
      }),
    [addFile]
  )

  useEffect(() => {
    window.studio.ui.onRemoveFile((file) => {
      removeFile(file)
    })
  }, [removeFile])
}
