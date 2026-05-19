import Fuse, { IFuseOptions } from 'fuse.js'
import { orderBy } from 'lodash-es'
import { useEffect, useMemo } from 'react'

import { useStudioUIStore } from '@/store/ui'
import { StudioFile } from '@/types'
import { withMatches } from '@/utils/fuse'
import * as path from '@/utils/path'

function orderByFileName(files: Map<string, StudioFile>) {
  return orderBy([...files.values()], (s) => s.displayName)
}

function toFileMap(files: StudioFile[]) {
  return new Map(files.map((file) => [path.key(file.path), file]))
}

function useFolderContent() {
  const recordings = useStudioUIStore((s) => orderByFileName(s.recordings))
  const generators = useStudioUIStore((s) => orderByFileName(s.generators))
  const browserTests = useStudioUIStore((s) => orderByFileName(s.browserTests))
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

  return {
    recordings,
    tests: [...generators, ...browserTests].sort((a, b) =>
      a.displayName.localeCompare(b.displayName)
    ),
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
      tests: new Fuse(files.tests, options),
      scripts: new Fuse(files.scripts, options),
      dataFiles: new Fuse(files.dataFiles, options),
    }
  }, [files])

  return useMemo(() => {
    const counts = {
      recordings: files.recordings.length,
      tests: files.tests.length,
      scripts: files.scripts.length,
      dataFiles: files.dataFiles.length,
    }

    const isSearching = searchTerm.trim() !== ''
    const isEmpty = {
      recordings: counts.recordings === 0 && !isSearching,
      tests: counts.tests === 0 && !isSearching,
      scripts: counts.scripts === 0 && !isSearching,
      dataFiles: counts.dataFiles === 0 && !isSearching,
    }

    if (!isSearching) {
      return { ...files, counts, isEmpty }
    }

    return {
      recordings: searchIndex.recordings.search(searchTerm).map(withMatches),
      tests: searchIndex.tests.search(searchTerm).map(withMatches),
      scripts: searchIndex.scripts.search(searchTerm).map(withMatches),
      dataFiles: searchIndex.dataFiles.search(searchTerm).map(withMatches),
      counts,
      isEmpty,
    }
  }, [files, searchIndex, searchTerm])
}
