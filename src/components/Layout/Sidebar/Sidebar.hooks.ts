import { useStudioUIStore } from '@/store/ui'
import { StudioFile } from '@/types'
import { fileFromFileName } from '@/utils/file'
import { orderBy } from 'lodash-es'
import { useEffect } from 'react'

function orderByFileName(files: Map<string, StudioFile>) {
  return orderBy([...files.values()], (s) => s.fileName)
}

function toFileMap(files: string[]) {
  return new Map(
    files.map((fileName) => [fileName, fileFromFileName(fileName)])
  )
}

export function useFolderContent() {
  const recordings = useStudioUIStore((s) => orderByFileName(s.recordings))
  const generators = useStudioUIStore((s) => orderByFileName(s.generators))
  const scripts = useStudioUIStore((s) => orderByFileName(s.scripts))

  const addFile = useStudioUIStore((s) => s.addFile)
  const removeFile = useStudioUIStore((s) => s.removeFile)
  const setFolderContent = useStudioUIStore((s) => s.setFolderContent)

  useEffect(() => {
    window.studio.ui.getFiles().then((files) => {
      setFolderContent({
        recordings: toFileMap(files.recordings),
        generators: toFileMap(files.generators),
        scripts: toFileMap(files.scripts),
      })
    })
  }, [setFolderContent])

  useEffect(
    () =>
      window.studio.ui.onAddFile((path) => {
        addFile(path)
      }),
    [addFile]
  )

  useEffect(() => {
    window.studio.ui.onRemoveFile((path) => {
      removeFile(path)
    })
  }, [removeFile])

  return {
    recordings,
    generators,
    scripts,
  }
}
