import { css } from '@emotion/react'
import { Badge, Flex, IconButton, Tooltip } from '@radix-ui/themes'
import { ReactNode } from 'react'

interface NavIconButtonProps {
  icon: ReactNode
  itemCount: number
  active: boolean
  tooltip: string
  onClick?: () => void
}

export function VerticalTabButton({
  icon,
  tooltip,
  itemCount,
  active,
  onClick,
}: NavIconButtonProps) {
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
          aria-label={tooltip}
          variant="ghost"
          color={active ? 'orange' : 'gray'}
          size="4"
          css={css`
            margin: 0;

            svg {
              width: 24px;
              height: 24px;
            }
          `}
          onClick={onClick}
        >
          {icon}
        </IconButton>
        {itemCount > 0 && (
          <Badge
            radius="full"
            variant="solid"
            color={active ? 'orange' : 'gray'}
            size="1"
            css={css`
              position: absolute;
              top: -4px;
              right: 4px;
              cursor: default;
              font-size: 9px;
              line-height: 12px;
              min-height: 16px;
              min-width: 16px;
              justify-content: center;
              padding: 0 2px;
            `}
          >
            {itemCount > 99 ? '99+' : itemCount}
          </Badge>
        )}
      </Flex>
    </Tooltip>
  )
}
