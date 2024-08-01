import * as Collapsible from '@radix-ui/react-collapsible'
import { CaretDownIcon, CaretRightIcon } from '@radix-ui/react-icons'
import { Badge, Flex, IconButton, Text } from '@radix-ui/themes'
import { useState } from 'react'

import { FileList } from './FileList'

interface FileTreeProps {
  label: string
  files: string[]
  viewPath: string
  noFilesMessage?: string
}

export function FileTree({
  label,
  files,
  viewPath,
  noFilesMessage = 'No files found',
}: FileTreeProps) {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Flex align="center" gap="2" width="100%" pl="1" pt="1">
        <Collapsible.Trigger asChild>
          <IconButton variant="ghost" color="gray" radius="full" size="1">
            {open ? <CaretDownIcon /> : <CaretRightIcon />}
          </IconButton>
        </Collapsible.Trigger>
        <Text size="2">{label}</Text>
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
