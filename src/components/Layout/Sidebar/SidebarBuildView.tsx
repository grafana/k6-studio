import { Flex, ScrollArea } from '@radix-ui/themes'

import { FileTree } from '@/components/FileTree'
import { FileItem } from '@/components/FileTree/types'
import { NewTestMenu } from '@/components/NewTestMenu'
import { useFeaturesStore } from '@/store/features'

interface SidebarBuildViewProps {
  tests: FileItem[]
  dataFiles: FileItem[]
}

export function SidebarBuildView({ tests, dataFiles }: SidebarBuildViewProps) {
  const isBrowserEditorEnabled = useFeaturesStore(
    (state) => state.features['browser-test-editor']
  )
  return (
    <ScrollArea scrollbars="vertical">
      <Flex direction="column" gap="2" pb="2">
        <FileTree
          label={isBrowserEditorEnabled ? 'Tests' : 'Test generators'}
          files={tests}
          noFilesMessage={
            isBrowserEditorEnabled ? 'No tests found' : 'No generators found'
          }
          actions={<NewTestMenu />}
        />
        <FileTree
          label="Data files"
          files={dataFiles}
          noFilesMessage="No data files found"
        />
      </Flex>
    </ScrollArea>
  )
}
