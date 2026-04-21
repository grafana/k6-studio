import { css } from '@emotion/react'
import { Badge, Button, Tooltip } from '@radix-ui/themes'
import { TriangleAlertIcon } from 'lucide-react'
import { ComponentPropsWithoutRef, ReactNode, Ref } from 'react'

type ValuePopoverBadgeProps = {
  displayValue: ReactNode | string
  ref?: Ref<HTMLButtonElement>
  error?: string | null
} & ComponentPropsWithoutRef<typeof Button>

export function ValuePopoverBadge({
  ref,
  displayValue,
  error,
  ...buttonProps
}: ValuePopoverBadgeProps) {
  return (
    <Badge color={error ? 'red' : 'gray'} asChild>
      <Button
        ref={ref}
        size="1"
        {...buttonProps}
        css={css`
          display: flex;
          justify-content: flex-start;
          flex-shrink: 1;
          overflow: hidden;
        `}
      >
        {typeof displayValue === 'string' ? (
          <span
            css={css`
              text-overflow: ellipsis;
              white-space: nowrap;
              overflow: hidden;
            `}
          >
            {displayValue}
          </span>
        ) : (
          displayValue
        )}
        {error && (
          <Tooltip content={error}>
            <TriangleAlertIcon />
          </Tooltip>
        )}
      </Button>
    </Badge>
  )
}
