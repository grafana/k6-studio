import { css } from '@emotion/react'

import { useActiveFilePath } from '@/hooks/useCurrentFile'

import { File, NoFileMessage } from './File'
import { FileItem } from './types'

interface FileListProps {
  files: FileItem[]
  noFilesMessage: string
}

export function FileList({ files, noFilesMessage }: FileListProps) {
  const activeFilePath = useActiveFilePath()

  if (files.length === 0) {
    return <NoFileMessage message={noFilesMessage} />
  }

  return (
    <ul
      css={css`
        list-style: none;
        padding: 0;
        margin: var(--space-1) 0 0;
      `}
    >
      {files.map((file) => (
        <li key={file.displayName}>
          <File file={file} isSelected={file.path === activeFilePath} />
        </li>
      ))}
    </ul>
  )
}
