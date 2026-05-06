import Fuse, { IFuseOptions } from 'fuse.js'
import { useMemo } from 'react'

import { useStudioUIStore } from '@/store/ui'
import { StudioFile } from '@/types'
import { withMatches } from '@/utils/fuse'

function sortByDisplayName(files: Map<string, StudioFile>) {
  return [...files.values()].sort((a, b) =>
    a.displayName.localeCompare(b.displayName)
  )
}

export function useFiles(searchTerm: string) {
  const recordingsMap = useStudioUIStore((s) => s.recordings)
  const generatorsMap = useStudioUIStore((s) => s.generators)
  const browserTestsMap = useStudioUIStore((s) => s.browserTests)
  const scriptsMap = useStudioUIStore((s) => s.scripts)
  const dataFilesMap = useStudioUIStore((s) => s.dataFiles)

  const recordings = useMemo(
    () => sortByDisplayName(recordingsMap),
    [recordingsMap]
  )
  const generators = useMemo(
    () => sortByDisplayName(generatorsMap),
    [generatorsMap]
  )
  const browserTests = useMemo(
    () => sortByDisplayName(browserTestsMap),
    [browserTestsMap]
  )
  const scripts = useMemo(() => sortByDisplayName(scriptsMap), [scriptsMap])
  const dataFiles = useMemo(
    () => sortByDisplayName(dataFilesMap),
    [dataFilesMap]
  )

  const tests = useMemo(
    () =>
      [...generators, ...browserTests].sort((a, b) =>
        a.displayName.localeCompare(b.displayName)
      ),
    [generators, browserTests]
  )

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
      recordings: new Fuse(recordings, options),
      tests: new Fuse(tests, options),
      scripts: new Fuse(scripts, options),
      dataFiles: new Fuse(dataFiles, options),
    }
  }, [recordings, tests, scripts, dataFiles])

  return useMemo(() => {
    const counts = {
      recordings: recordings.length,
      tests: tests.length,
      scripts: scripts.length,
      dataFiles: dataFiles.length,
    }

    const isSearching = searchTerm.trim() !== ''
    const isEmpty = {
      recordings: counts.recordings === 0 && !isSearching,
      tests: counts.tests === 0 && !isSearching,
      scripts: counts.scripts === 0 && !isSearching,
      dataFiles: counts.dataFiles === 0 && !isSearching,
    }

    if (!isSearching) {
      return { recordings, tests, scripts, dataFiles, counts, isEmpty }
    }

    return {
      recordings: searchIndex.recordings.search(searchTerm).map(withMatches),
      tests: searchIndex.tests.search(searchTerm).map(withMatches),
      scripts: searchIndex.scripts.search(searchTerm).map(withMatches),
      dataFiles: searchIndex.dataFiles.search(searchTerm).map(withMatches),
      counts,
      isEmpty,
    }
  }, [recordings, tests, scripts, dataFiles, searchIndex, searchTerm])
}
