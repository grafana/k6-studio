import { css } from '@emotion/react'
import { Badge, Button, Popover, Tooltip } from '@radix-ui/themes'
import { TriangleAlertIcon } from 'lucide-react'
import { ComponentProps, ReactNode } from 'react'

interface FormPopoverProps extends ComponentProps<typeof Popover.Root> {
  displayValue: ReactNode | string
  error?: string | null
  width?: string
  children: ReactNode
}

export function FormPopover({
  displayValue,
  error,
  width = '300px',
  children,
  ...props
}: FormPopoverProps) {
  return (
    <Popover.Root {...props}>
      <Popover.Trigger>
        <Badge color={error ? 'red' : 'gray'} asChild>
          <Button
            size="1"
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
      </Popover.Trigger>
      <Popover.Content align="start" size="1" width={width}>
        {children}
      </Popover.Content>
    </Popover.Root>
  )
}
