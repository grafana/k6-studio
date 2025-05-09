import { css } from '@emotion/react'
import * as Collapsible from '@radix-ui/react-collapsible'
import { Flex, Reset, Text } from '@radix-ui/themes'
import { ChevronDownIcon, ChevronRight } from 'lucide-react'
import { ReactNode, useState } from 'react'

import { FileList } from './FileList'
import { FileItem } from './types'

interface FileTreeProps {
  label: string
  files: FileItem[]
  noFilesMessage?: string
  actions?: ReactNode
}

export function FileTree({
  label,
  files,
  noFilesMessage = 'No files found',
  actions,
}: FileTreeProps) {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Flex align="center" gap="2" width="100%" px="1" pt="1">
        <Collapsible.Trigger asChild>
          <Reset>
            <button type="button">
              <Flex align="center" gap="1">
                {open ? <ChevronDownIcon /> : <ChevronRight />}
                <Text
                  size="2"
                  css={css`
                    flex-grow: 1;
                    font-weight: 600;
                    font-size: 12px;
                    text-transform: uppercase;
                  `}
                >
                  {label} ({files.length})
                </Text>
              </Flex>
            </button>
          </Reset>
        </Collapsible.Trigger>

        {actions}
      </Flex>
      <Collapsible.Content>
        <FileList files={files} noFilesMessage={noFilesMessage} />
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
