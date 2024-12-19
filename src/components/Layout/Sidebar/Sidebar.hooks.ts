import { useStudioUIStore } from '@/store/ui'
import { StudioFile } from '@/types'
import { fileFromFileName } from '@/utils/file'
import { withMatches } from '@/utils/fuse'
import Fuse, { IFuseOptions } from 'fuse.js'
import { orderBy } from 'lodash-es'
import { useEffect, useMemo } from 'react'

function orderByFileName(files: Map<string, StudioFile>) {
  return orderBy([...files.values()], (s) => s.fileName)
}

function toFileMap(files: string[]) {
  return new Map(
    files.map((fileName) => [fileName, fileFromFileName(fileName)])
  )
}

function useFolderContent() {
  const recordings = useStudioUIStore((s) => orderByFileName(s.recordings))
  const generators = useStudioUIStore((s) => orderByFileName(s.generators))
  const scripts = useStudioUIStore((s) => orderByFileName(s.scripts))

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
      })
    })()
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
    }
  }, [files, searchIndex, searchTerm])
}
