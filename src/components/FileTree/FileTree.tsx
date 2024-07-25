import { css } from '@emotion/react'
import * as Collapsible from '@radix-ui/react-collapsible'
import { CaretDownIcon, CaretRightIcon } from '@radix-ui/react-icons'
import { Badge, Flex, IconButton } from '@radix-ui/themes'
import { useState } from 'react'

import { File } from './File'

interface FileTreeProps {
  label: string
  files: string[]
  onOpenFile?: (path: string) => void
}

export function FileTree({ label, files, onOpenFile }: FileTreeProps) {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Flex align="center" gap="2" pl="1">
        <Collapsible.Trigger asChild>
          <IconButton
            size="1"
            variant="ghost"
            aria-label={`
            ${open ? 'Collapse' : 'Expand'} ${label}
          `}
          >
            {open ? <CaretDownIcon /> : <CaretRightIcon />}
          </IconButton>
        </Collapsible.Trigger>
        {label} <Badge radius="full">{files.length}</Badge>
      </Flex>
      <Collapsible.Content>
        <ul
          css={css`
            list-style: none;
            padding-left: 1rem;
          `}
        >
          {files.map((file) => (
            <li key={file}>
              <File path={file} onOpen={onOpenFile} />
            </li>
          ))}
        </ul>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
