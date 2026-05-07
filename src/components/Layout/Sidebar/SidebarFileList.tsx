import { Flex, ScrollArea } from '@radix-ui/themes'
import { ReactNode } from 'react'

import { FileList } from '@/components/FileList'
import { StudioFile } from '@/types'

import { SidebarEmptyState } from './SidebarEmptyState'
import { SidebarSearchBar } from './SidebarSearchBar'

interface SidebarFileListProps {
  isEmpty: boolean
  files: StudioFile[]
  searchTerm: string
  placeholder: string
  noFilesMessage: string
  emptyMessage: string
  emptyAction: ReactNode
  onSearchChange: (value: string) => void
}

export function SidebarFileList({
  isEmpty,
  files,
  searchTerm,
  placeholder,
  noFilesMessage,
  emptyMessage,
  emptyAction,
  onSearchChange,
}: SidebarFileListProps) {
  if (isEmpty) {
    return <SidebarEmptyState message={emptyMessage} action={emptyAction} />
  }

  return (
    <>
      <SidebarSearchBar
        filter={searchTerm}
        placeholder={placeholder}
        onChange={onSearchChange}
      />
      <ScrollArea scrollbars="vertical">
        <Flex direction="column" gap="2" py="2">
          <FileList files={files} noFilesMessage={noFilesMessage} />
        </Flex>
      </ScrollArea>
    </>
  )
}
