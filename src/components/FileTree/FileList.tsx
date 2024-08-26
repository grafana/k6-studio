import { css } from '@emotion/react'
import { File, NoFileMessage } from './File'
import { useParams } from 'react-router-dom'

interface FileListProps {
  files: string[]
  viewPath: string
  noFilesMessage: string
  onOpenFile?: (path: string) => void
}

export function FileList({ files, noFilesMessage, viewPath }: FileListProps) {
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
        <li key={file}>
          <File
            fileName={file}
            isSelected={file === currentFile}
            viewPath={viewPath}
          />
        </li>
      ))}
    </ul>
  )
}
