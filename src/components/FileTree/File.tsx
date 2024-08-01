import { css } from '@emotion/react'
import { Button, Tooltip } from '@radix-ui/themes'

import { getFileNameFromPath } from '@/utils/file'
import { Link } from 'react-router-dom'

interface FileProps {
  path: string
  viewPath: string
  isSelected: boolean
}

export function File({ path, viewPath, isSelected }: FileProps) {
  const fileName = getFileNameFromPath(path)

  return (
    <Tooltip content={path}>
      <Button
        variant="outline"
        color={isSelected ? 'violet' : 'gray'}
        radius="full"
        css={css`
          width: 100%;
          max-width: 100%;
          justify-content: flex-start;
          border: none;
          box-shadow: none;
        `}
        asChild
      >
        <Link to={`${viewPath}/${encodeURIComponent(path)}`}>
          <span
            css={css`
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            `}
          >
            {fileName}
          </span>
        </Link>
      </Button>
    </Tooltip>
  )
}
