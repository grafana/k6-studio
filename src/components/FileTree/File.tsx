import { css } from '@emotion/react'
import { Button, Tooltip } from '@radix-ui/themes'

interface FileProps {
  path: string
  onOpen?: (path: string) => void
}

export function File({ path, onOpen }: FileProps) {
  const fileName = path.split('/').pop()

  return (
    <Tooltip content={path}>
      <Button
        variant="outline"
        onClick={() => onOpen?.(path)}
        color="gray"
        radius="full"
        css={css`
          width: 100%;
          max-width: 100%;
          justify-content: flex-start;
          border: none;
          box-shadow: none;
        `}
      >
        <span
          css={css`
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          `}
        >
          {fileName}
        </span>
      </Button>
    </Tooltip>
  )
}
