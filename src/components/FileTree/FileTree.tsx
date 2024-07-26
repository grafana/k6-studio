import * as Collapsible from '@radix-ui/react-collapsible'
import { CaretDownIcon, CaretRightIcon } from '@radix-ui/react-icons'
import { Badge, Flex, IconButton, Text } from '@radix-ui/themes'
import { useState } from 'react'

import { FileList } from './FileList'

interface FileTreeProps {
  label: string
  files: string[]
  noFilesMessage?: string
  onOpenFile?: (path: string) => void
}

export function FileTree({
  label,
  files,
  noFilesMessage = 'No files found',
  onOpenFile,
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
          onOpenFile={onOpenFile}
          noFilesMessage={noFilesMessage}
        />
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
