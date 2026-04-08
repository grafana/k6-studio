import { Box, Flex } from '@radix-ui/themes'

import { exhaustive } from '@/utils/typescript'

import { SidebarTab } from '../Layout.types'

import { BuildTab } from './BuildTab'
import { RecordTab } from './RecordTab'
import { RunTab } from './RunTab'

interface SidebarProps {
  activeTab: SidebarTab
  isExpanded?: boolean
  onCollapseSidebar: () => void
}

export function Sidebar({ activeTab, onCollapseSidebar }: SidebarProps) {
  // const { recordings, tests, scripts, dataFiles } = useFiles(searchTerm)
  // const handleImportDataFile = useImportDataFile()
  // const isBrowserEditorEnabled = useFeaturesStore(
  //   (state) => state.features['browser-test-editor']
  // )

  return (
    <Box
      height="100%"
      maxHeight="100%"
      maxWidth="100%"
      overflow="hidden"
      position="relative"
      asChild
    >
      <Flex direction="column">
        <SidebarContent
          activeTab={activeTab}
          onCollapseSidebar={onCollapseSidebar}
        />
      </Flex>
    </Box>
  )
}

function SidebarContent({
  activeTab,
  onCollapseSidebar,
}: {
  activeTab: SidebarTab
  onCollapseSidebar: () => void
}) {
  switch (activeTab) {
    case 'record':
      return <RecordTab onCollapseSidebar={onCollapseSidebar} />
    case 'build':
      return <BuildTab onCollapseSidebar={onCollapseSidebar} />
    case 'validate':
      return <RunTab onCollapseSidebar={onCollapseSidebar} />
    default:
      return exhaustive(activeTab)
  }
}
