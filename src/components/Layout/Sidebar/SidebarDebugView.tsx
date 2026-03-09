import { Flex, ScrollArea } from '@radix-ui/themes'

import { FileTree } from '@/components/FileTree'
import { FileItem } from '@/components/FileTree/types'

interface SidebarDebugViewProps {
  scripts: FileItem[]
}

export function SidebarDebugView({ scripts }: SidebarDebugViewProps) {
  return (
    <ScrollArea scrollbars="vertical">
      <Flex direction="column" gap="2" pb="2">
        <FileTree
          label="Scripts"
          files={scripts}
          noFilesMessage="No scripts found"
        />
      </Flex>
    </ScrollArea>
  )
}
