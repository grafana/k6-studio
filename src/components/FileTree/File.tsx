import { css } from '@emotion/react'
import { NavLink } from 'react-router-dom'

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
      <NavLink
        css={css`
          display: block;
          padding: var(--space-1) var(--space-2) var(--space-1) var(--space-5);
          color: var(--gray-11);
          font-size: 12px;
          font-weight: ${isSelected ? 700 : 400};
          line-height: 22px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-decoration: none;

          &:hover {
            background-color: var(--gray-4);
          }

          &.active {
            color: var(--accent-9);
          }
        `}
        to={`${viewPath}/${encodeURIComponent(path)}`}
      >
        {fileName}
      </NavLink>
    </FileContextMenu>
  )
}

export function NoFileMessage({ message }: { message: string }) {
  return (
    <span
      css={css`
        display: block;
        padding: var(--space-1) var(--space-2) var(--space-1) var(--space-5);
        color: var(--gray-11);
        font-size: 12px;
        line-height: 22px;
      `}
    >
      {message}
    </span>
  )
}
