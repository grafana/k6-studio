import * as Collapsible from '@radix-ui/react-collapsible'
import { CaretDownIcon, CaretRightIcon } from '@radix-ui/react-icons'
import { Flex, Reset, Text } from '@radix-ui/themes'
import { ReactNode, useState } from 'react'

import { FileList } from './FileList'
import { css } from '@emotion/react'
import { useDebounce } from 'react-use'

interface FileTreeProps {
  label: string
  files: string[]
  viewPath: string
  noFilesMessage?: string
  actions?: ReactNode
}

export function FileTree({
  label,
  files: filesRaw,
  viewPath,
  noFilesMessage = 'No files found',
  actions,
}: FileTreeProps) {
  const [open, setOpen] = useState(true)

  // Debounce to avoid flickering in of files when renaming
  const [files, setFiles] = useState<string[]>([])
  useDebounce(() => setFiles(filesRaw), 50, [filesRaw])

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Flex align="center" gap="2" width="100%" px="1" pt="1">
        <Collapsible.Trigger asChild>
          <Reset>
            <button type="button">
              <Flex align="center" gap="1">
                {open ? (
                  <CaretDownIcon width="16" height="16" />
                ) : (
                  <CaretRightIcon width="16" height="16" />
                )}
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
        <FileList
          files={files}
          viewPath={viewPath}
          noFilesMessage={noFilesMessage}
        />
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
