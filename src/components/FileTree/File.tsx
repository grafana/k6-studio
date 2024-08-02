import { css } from '@emotion/react'
import { Text } from '@radix-ui/themes'
import { Link } from 'react-router-dom'

import { getFileNameFromPath } from '@/utils/file'
import { FileContextMenu } from './FileContextMenu'

interface FileProps {
  path: string
  viewPath: string
  isSelected: boolean
}

export function File({ path, viewPath, isSelected }: FileProps) {
  const fileName = getFileNameFromPath(path)

  return (
    <FileContextMenu path={path} isSelected={isSelected}>
      <Text
        size="2"
        color={isSelected ? 'violet' : 'gray'}
        css={css`
          display: block;
          padding: var(--space-1) var(--space-2);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-decoration: none;

          &:hover {
            background-color: var(--gray-4);
          }
        `}
        asChild
      >
        <Link to={`${viewPath}/${encodeURIComponent(path)}`}>{fileName}</Link>
      </Text>
    </FileContextMenu>
  )
}

export function NoFileMessage({ message }: { message: string }) {
  return (
    <Text
      size="2"
      color="gray"
      css={css`
        display: block;
        padding: var(--space-1) var(--space-2);
      `}
    >
      {message}
    </Text>
  )
}
