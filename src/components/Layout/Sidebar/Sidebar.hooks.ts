import Fuse, { IFuseOptions } from 'fuse.js'
import { orderBy } from 'lodash-es'
import { useEffect, useMemo } from 'react'

import type { FileItem } from '@/components/FileTree/types'
import { useStudioUIStore } from '@/store/ui'
import { StudioFile } from '@/types'
import { withMatches } from '@/utils/fuse'

export function orderByFileName(files: Map<string, StudioFile>) {
  return orderBy([...files.values()], (s) => s.displayName)
}

function toFileMap(files: StudioFile[]) {
  return new Map(files.map((file) => [file.path, file]))
}

const fuseListOptions: IFuseOptions<StudioFile> = {
  includeMatches: true,

  // Though not perfect, these settings seem
  // to yield pretty good results. It should allow
  // single character typos anywhere in the string.
  ignoreLocation: true,
  distance: 1,

  keys: ['displayName'],
}

/**
 * Loads folder listings and subscribes to workspace file add/remove events. Call once
 * (e.g. from the sidebar shell) so file lists stay in sync.
 */
export function useWorkspaceFolderSync() {
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
      window.studio.workspace.onAddFile((file) => {
        addFile(file)
      }),
    [addFile]
  )

  useEffect(() => {
    window.studio.workspace.onRemoveFile((file) => {
      removeFile(file)
    })
  }, [removeFile])
}

export function useFuzzyFileList(
  files: StudioFile[],
  searchTerm: string
): FileItem[] {
  const fuse = useMemo(() => new Fuse(files, fuseListOptions), [files])

  return useMemo(() => {
    if (searchTerm.match(/^\s*$/)) {
      return files
    }

    return fuse.search(searchTerm).map(withMatches)
  }, [files, fuse, searchTerm])
}
