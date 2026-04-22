import Fuse, { IFuseOptions } from 'fuse.js'
import { orderBy } from 'lodash-es'
import { useMemo } from 'react'

import { useStudioUIStore } from '@/store/ui'
import { StudioFile } from '@/types'
import { withMatches } from '@/utils/fuse'

function orderByFileName(files: Map<string, StudioFile>) {
  return orderBy([...files.values()], (s) => s.displayName)
}

export function useFiles(searchTerm: string) {
  const recordings = useStudioUIStore((s) => orderByFileName(s.recordings))
  const generators = useStudioUIStore((s) => orderByFileName(s.generators))
  const browserTests = useStudioUIStore((s) => orderByFileName(s.browserTests))
  const scripts = useStudioUIStore((s) => orderByFileName(s.scripts))
  const dataFiles = useStudioUIStore((s) => orderByFileName(s.dataFiles))

  const tests = [...generators, ...browserTests].sort((a, b) =>
    a.displayName.localeCompare(b.displayName)
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
    if (searchTerm.match(/^\s*$/)) {
      return { recordings, tests, scripts, dataFiles }
    }

    return {
      recordings: searchIndex.recordings.search(searchTerm).map(withMatches),
      tests: searchIndex.tests.search(searchTerm).map(withMatches),
      scripts: searchIndex.scripts.search(searchTerm).map(withMatches),
      dataFiles: searchIndex.dataFiles.search(searchTerm).map(withMatches),
    }
  }, [recordings, tests, scripts, dataFiles, searchIndex, searchTerm])
}
