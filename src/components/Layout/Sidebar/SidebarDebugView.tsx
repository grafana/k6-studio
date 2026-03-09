import { ScrollArea } from '@radix-ui/themes'

import { FileList } from '@/components/FileTree/FileList'
import { FileItem } from '@/components/FileTree/types'

import { SidebarPanelHeading } from './SidebarPanelHeading'

interface SidebarDebugViewProps {
  scripts: FileItem[]
}

export function SidebarDebugView({ scripts }: SidebarDebugViewProps) {
  return (
    <ScrollArea scrollbars="vertical">
      <SidebarPanelHeading count={scripts.length}>Scripts</SidebarPanelHeading>
      <FileList files={scripts} noFilesMessage="No scripts found" />
    </ScrollArea>
  )
}
