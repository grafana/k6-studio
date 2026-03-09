import { Box, ScrollArea } from '@radix-ui/themes'

import { WorkspaceFileTree } from '@/components/WorkspaceFileTree'

export function SidebarWorkspaceView() {
  return (
    <ScrollArea scrollbars="vertical">
      <Box px="2">
        <WorkspaceFileTree />
      </Box>
    </ScrollArea>
  )
}
