import * as Collapsible from '@radix-ui/react-collapsible'
import { CaretDownIcon, CaretRightIcon } from '@radix-ui/react-icons'
import { Box, Flex, Reset } from '@radix-ui/themes'
import { ReactNode, useState } from 'react'
import './CollapsibleSection.styles.css'
import { css } from '@emotion/react'

interface CollapsibleSectionProps {
  defaultOpen?: boolean
  iconSize?: number
  noTrigger?: boolean
  content: ReactNode
  actions?: ReactNode
  children: ReactNode
}

export function CollapsibleSection({
  defaultOpen = false,
  iconSize = 20,
  noTrigger = false,
  content,
  actions,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <div
        css={css`
          position: sticky;
          top: 0;
          z-index: 1;
          display: flex;
          align-items: center;
          background-color: var(--gray-2);
          border-top: 1px solid var(--gray-3);
          border-bottom: 1px solid var(--gray-3);
        `}
      >
        {noTrigger && (
          <Box
            css={css`
              flex: 1 1 0;
              padding: var(--space-2);
            `}
          >
            <HeaderContent open={open} iconSize={iconSize}>
              {children}
            </HeaderContent>
          </Box>
        )}
        {!noTrigger && (
          <Collapsible.Trigger
            asChild
            css={css`
              flex: 1 1 0;
              cursor: var(--cursor-button);
            `}
          >
            <Reset>
              <button
                type="button"
                css={css`
                  padding: var(--space-2);
                `}
              >
                <HeaderContent open={open} iconSize={iconSize}>
                  {children}
                </HeaderContent>
              </button>
            </Reset>
          </Collapsible.Trigger>
        )}
        {actions && (
          <Flex align="center" pr="3">
            {actions}
          </Flex>
        )}
      </div>

      <Collapsible.Content className="CollapsibleContent">
        {content}
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

interface HeaderContentProps {
  open: boolean
  iconSize: number
  children: ReactNode
}

function HeaderContent({ open, iconSize, children }: HeaderContentProps) {
  return (
    <Flex align="center" gap="1">
      {open ? (
        <CaretDownIcon height={iconSize} width={iconSize} />
      ) : (
        <CaretRightIcon height={iconSize} width={iconSize} />
      )}
      {children}
    </Flex>
  )
}
