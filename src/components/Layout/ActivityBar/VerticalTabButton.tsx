import { css } from '@emotion/react'
import { Flex, IconButton, Tooltip } from '@radix-ui/themes'
import { ReactNode } from 'react'

interface VerticalTabButtonProps {
  icon: ReactNode
  active?: boolean
  tooltip: string
  ref?: React.Ref<HTMLButtonElement>
  onClick?: () => void
}

export function VerticalTabButton({
  icon,
  tooltip,
  active,
  ref,
  onClick,
}: VerticalTabButtonProps) {
  return (
    <Tooltip content={tooltip} side="right">
      <Flex
        position="relative"
        width="100%"
        align="center"
        justify="center"
        css={
          active
            ? css`
                &::before {
                  content: '';
                  position: absolute;
                  left: 0;
                  top: 6px;
                  bottom: 6px;
                  width: 4px;
                  background-color: var(--accent-9);
                  border-radius: 0 4px 4px 0;
                }
              `
            : undefined
        }
      >
        <IconButton
          ref={ref}
          highContrast
          aria-label={tooltip}
          variant="ghost"
          color={active ? 'orange' : 'gray'}
          size="4"
          css={css`
            margin: 0;
          `}
          onClick={onClick}
        >
          {icon}
        </IconButton>
      </Flex>
    </Tooltip>
  )
}
