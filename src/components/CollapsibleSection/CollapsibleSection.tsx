import * as Collapsible from '@radix-ui/react-collapsible'
import { CaretDownIcon, CaretRightIcon } from '@radix-ui/react-icons'
import { Flex, IconButton } from '@radix-ui/themes'
import { useState } from 'react'
import './CollapsibleSection.styles.css'

export function CollapsibleSection({
  children,
  content,
  defaultOpen = false,
}: {
  children: React.ReactNode
  content: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger asChild style={{ cursor: 'var(--cursor-button)' }}>
        <Flex>
          {children}
          <Flex align="center" px="2">
            <IconButton variant="ghost">
              {open ? (
                <CaretDownIcon height="20" width="20" />
              ) : (
                <CaretRightIcon height="20" width="20" />
              )}
            </IconButton>
          </Flex>
        </Flex>
      </Collapsible.Trigger>

      <Collapsible.Content className="CollapsibleContent">
        {content}
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
