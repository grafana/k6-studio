import * as Collapsible from '@radix-ui/react-collapsible'
import { CaretDownIcon, CaretRightIcon } from '@radix-ui/react-icons'
import { Flex, Reset } from '@radix-ui/themes'
import { useState } from 'react'
import './CollapsibleSection.styles.css'
import { css } from '@emotion/react'

export function CollapsibleSection({
  children,
  content,
  defaultOpen = false,
  iconSize = 20,
}: {
  children: React.ReactNode
  content: React.ReactNode
  defaultOpen?: boolean
  iconSize?: number
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger
        asChild
        css={{
          cursor: 'var(--cursor-button)',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        <Reset>
          <button
            type="button"
            css={css`
              width: 100%;
              background-color: var(--gray-2);
              border-top: 1px solid var(--gray-3);
              border-bottom: 1px solid var(--gray-3);
              padding: var(--space-2);
            `}
          >
            <Flex align="center" gap="1">
              {open ? (
                <CaretDownIcon height={iconSize} width={iconSize} />
              ) : (
                <CaretRightIcon height={iconSize} width={iconSize} />
              )}
              {children}
            </Flex>
          </button>
        </Reset>
      </Collapsible.Trigger>

      <Collapsible.Content className="CollapsibleContent">
        {content}
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
