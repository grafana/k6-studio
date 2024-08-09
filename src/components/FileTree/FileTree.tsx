import * as Collapsible from '@radix-ui/react-collapsible'
import { CaretDownIcon, CaretRightIcon } from '@radix-ui/react-icons'
import { Badge, Flex, IconButton, Text } from '@radix-ui/themes'
import { ReactNode, useState } from 'react'

import { FileList } from './FileList'
import { css } from '@emotion/react'

interface FileTreeProps {
  label: string
  files: string[]
  viewPath: string
  noFilesMessage?: string
  actions?: ReactNode
}

export function FileTree({
  label,
  files,
  viewPath,
  noFilesMessage = 'No files found',
  actions,
}: FileTreeProps) {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Flex align="center" gap="2" width="100%" px="2" pt="1">
        <Collapsible.Trigger asChild>
          <IconButton variant="ghost" color="gray" radius="full" size="1">
            {open ? <CaretDownIcon /> : <CaretRightIcon />}
          </IconButton>
        </Collapsible.Trigger>
        <Text
          size="2"
          css={css`
            flex-grow: 1;
          `}
        >
          {label}
        </Text>
        {actions}
        <Badge radius="full" color="gray">
          {files.length}
        </Badge>
      </Flex>

      <Collapsible.Content>
        <FileList
          files={files}
          viewPath={viewPath}
          noFilesMessage={noFilesMessage}
        />
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
