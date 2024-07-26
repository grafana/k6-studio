import { css } from '@emotion/react'
import { Button } from '@radix-ui/themes'
import { File } from './File'
import { useStudioUIStore } from '@/store/ui'

interface FileListProps {
  files: string[]
  noFilesMessage: string
  onOpenFile?: (path: string) => void
}

export function FileList({ files, onOpenFile, noFilesMessage }: FileListProps) {
  const selectedFile = useStudioUIStore((state) => state.selectedFile)
  const setSelectedFile = useStudioUIStore((state) => state.setSelectedFile)

  const handleOpenFile = (path: string) => {
    if (!onOpenFile) return
    onOpenFile(path)
    setSelectedFile(path)
  }

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
          <File
            path={file}
            isSelected={selectedFile === file}
            onOpen={handleOpenFile}
          />
        </li>
      ))}
    </ul>
  )
}
