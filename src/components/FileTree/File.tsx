import { css } from '@emotion/react'
import { NavLink } from 'react-router-dom'

import { FileContextMenu } from './FileContextMenu'
import { useRef } from 'react'
import { Tooltip } from '@radix-ui/themes'
import { useOverflowCheck } from '@/hooks/useOverflowCheck'

interface FileProps {
  fileName: string
  viewPath: string
  isSelected: boolean
}

const fileStyle = css`
  display: block;
  padding: var(--space-1) var(--space-2) var(--space-1) var(--space-5);
  color: var(--gray-11);
  font-size: 12px;
  line-height: 22px;
`

export function File({ fileName, viewPath, isSelected }: FileProps) {
  const linkRef = useRef<HTMLAnchorElement>(null)
  const hasEllipsis = useOverflowCheck(linkRef)
  const displayName = fileName.replace(/\.[^/.]+$/, '')

  return (
    <FileContextMenu path={fileName} isSelected={isSelected}>
      <Tooltip content={displayName} hidden={!hasEllipsis}>
        <NavLink
          ref={linkRef}
          css={[
            fileStyle,
            css`
              font-weight: ${isSelected ? 700 : 400};
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
            `,
          ]}
          to={`${viewPath}/${encodeURIComponent(fileName)}`}
        >
          {displayName}
        </NavLink>
      </Tooltip>
    </FileContextMenu>
  )
}

export function NoFileMessage({ message }: { message: string }) {
  return <span css={fileStyle}>{message}</span>
}
