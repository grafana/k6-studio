import { ScrollArea } from '@radix-ui/themes'
import * as pathe from 'pathe'

import { WorkspaceFileTree } from '@/components/WorkspaceFileTree'
import { useWorkspace } from '@/contexts/WorkspaceContext'

import { SidebarPanelHeading } from './SidebarPanelHeading'

export function SidebarWorkspaceView() {
  const { workspacePath } = useWorkspace()

  const workspaceName = workspacePath
    ? pathe.basename(workspacePath)
    : 'Workspace'

  return (
    <ScrollArea scrollbars="vertical">
      <SidebarPanelHeading>{workspaceName}</SidebarPanelHeading>
      <WorkspaceFileTree />
    </ScrollArea>
  )
}
