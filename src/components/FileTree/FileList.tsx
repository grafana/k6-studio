import { css } from '@emotion/react'
import { Button } from '@radix-ui/themes'
import { File } from './File'
import { useParams } from 'react-router-dom'

interface FileListProps {
  files: string[]
  viewPath: string
  noFilesMessage: string
  onOpenFile?: (path: string) => void
}

export function FileList({ files, noFilesMessage, viewPath }: FileListProps) {
  const { path } = useParams()

  if (files.length === 0) {
    return (
      <Button
        variant="outline"
        color="gray"
        radius="full"
        disabled
        css={css`
          width: 100%;
          max-width: 100%;
          justify-content: flex-start;
          border: none;
          box-shadow: none;
          margin: var(--space-1);
        `}
      >
        {noFilesMessage}
      </Button>
    )
  }

  return (
    <ul
      css={css`
        list-style: none;
        padding: var(--space-1);
        margin: var(--space-1) 0 0;
      `}
    >
      {files.map((file) => (
        <li key={file}>
          <File path={file} isSelected={file === path} viewPath={viewPath} />
        </li>
      ))}
    </ul>
  )
}
