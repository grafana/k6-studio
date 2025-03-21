import Fuse, { IFuseOptions } from 'fuse.js'
import { orderBy } from 'lodash-es'
import { useEffect, useMemo } from 'react'

import { useStudioUIStore } from '@/store/ui'
import { StudioFile } from '@/types'
import { withMatches } from '@/utils/fuse'

function orderByFileName(files: Map<string, StudioFile>) {
  return orderBy([...files.values()], (s) => s.displayName)
}

function toFileMap(files: StudioFile[]) {
  return new Map(files.map((file) => [file.fileName, file]))
}

function useFolderContent() {
  const recordings = useStudioUIStore((s) => orderByFileName(s.recordings))
  const generators = useStudioUIStore((s) => orderByFileName(s.generators))
  const scripts = useStudioUIStore((s) => orderByFileName(s.scripts))
  const dataFiles = useStudioUIStore((s) => orderByFileName(s.dataFiles))

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

  return {
    recordings,
    generators,
    scripts,
    dataFiles,
  }
}

export function useFiles(searchTerm: string) {
  const files = useFolderContent()

  const searchIndex = useMemo(() => {
    const options: IFuseOptions<StudioFile> = {
      includeMatches: true,

      // Though not perfect, these settings seem
      // to yield pretty good results. It should allow
      // single character typos anywhere in the string.
      ignoreLocation: true,
      distance: 1,

      keys: ['displayName'],
    }

    return {
      recordings: new Fuse(files.recordings, options),
      generators: new Fuse(files.generators, options),
      scripts: new Fuse(files.scripts, options),
      dataFiles: new Fuse(files.dataFiles, options),
    }
  }, [files])

  return useMemo(() => {
    if (searchTerm.match(/^\s*$/)) {
      return files
    }

    return {
      recordings: searchIndex.recordings.search(searchTerm).map(withMatches),
      generators: searchIndex.generators.search(searchTerm).map(withMatches),
      scripts: searchIndex.scripts.search(searchTerm).map(withMatches),
      dataFiles: searchIndex.dataFiles.search(searchTerm).map(withMatches),
    }
  }, [files, searchIndex, searchTerm])
}
