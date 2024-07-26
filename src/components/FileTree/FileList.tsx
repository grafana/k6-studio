import { css } from '@emotion/react'
import { Text } from '@radix-ui/themes'
import { File } from './File'

interface FileListProps {
  files: string[]
  noFilesMessage: string
  onOpenFile?: (path: string) => void
}

export function FileList({ files, onOpenFile, noFilesMessage }: FileListProps) {
  if (files.length === 0) {
    return (
      <Text
        size="2"
        color="gray"
        css={css`
          padding: var(--space-1);
        `}
      >
        {noFilesMessage}
      </Text>
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
          <File path={file} onOpen={onOpenFile} />
        </li>
      ))}
    </ul>
  )
}
