import { css } from '@emotion/react'
import { Button, Tooltip } from '@radix-ui/themes'

interface FileProps {
  path: string
  onOpen?: (path: string) => void
}

export function File({ path, onOpen }: FileProps) {
  const fileName = path.split('/').pop()

  return (
    <Button
      variant="ghost"
      onClick={() => onOpen?.(path)}
      color="gray"
      css={css`
        width: 100%;
        max-width: 100%;
        text-align: left;
        justify-content: flex-start;
      `}
    >
      <Tooltip content={path}>
        <span
          css={css`
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          `}
        >
          {fileName}
        </span>
      </Tooltip>
    </Button>
  )
}
