import { css } from '@emotion/react'
import { useParams } from 'react-router-dom'

import { File, NoFileMessage } from './File'
import { FileItem } from './types'

interface FileListProps {
  files: FileItem[]
  noFilesMessage: string
  onOpenFile?: (path: string) => void
}

export function FileList({ files, noFilesMessage }: FileListProps) {
  const { fileName: currentFile } = useParams()

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
          <File file={file} isSelected={file.fileName === currentFile} />
        </li>
      ))}
    </ul>
  )
}
