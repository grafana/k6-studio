import { Button, Flex, IconButton, Tooltip } from '@radix-ui/themes'
import log from 'electron-log/renderer'
import { HistoryIcon, PlusIcon, UploadIcon, VideoIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
} from '@/components/primitives/ResizablePanel'
import { getRoutePath, getViewPath } from '@/routeMap'
import { useToast } from '@/store/ui/useToast'

import { RecentURLsPanel } from './RecentURLsPanel'
import { useFiles } from './Sidebar.hooks'
import { SidebarFileList } from './SidebarFileList'
import { SidebarHeader } from './SidebarHeader'

interface RecordTabProps {
  onCollapseSidebar: () => void
}

export function RecordTab({ onCollapseSidebar }: RecordTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { recordings, isEmpty } = useFiles(searchTerm)
  const showToast = useToast()
  const navigate = useNavigate()

  const handleImportRecording = async () => {
    try {
      const filePath = await window.studio.har.importFile()

      if (filePath) {
        navigate(getViewPath(filePath))
      }
    } catch (error) {
      showToast({
        title: 'Failed to import recording',
        status: 'error',
      })
      log.error(error)
    }
  }

  const layout = useDefaultLayout({
    groupId: 'sidebar-record-tab',
    storage: localStorage,
  })

  return (
    <Group {...layout} id="sidebar-record-tab" orientation="vertical">
      <Panel minSize={200} defaultSize="70%" id="sidebar-record-tab-recordings">
        <Flex direction="column" height="100%">
          <SidebarHeader
            icon={<VideoIcon />}
            title="Recordings"
            actions={
              <>
                <Tooltip content="Import recording" side="right">
                  <IconButton
                    aria-label="Import recording"
                    variant="ghost"
                    size="1"
                    color="gray"
                    onClick={handleImportRecording}
                  >
                    <UploadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip content="New recording" side="right">
                  <IconButton
                    asChild
                    aria-label="New recording"
                    variant="ghost"
                    size="1"
                    color="gray"
                  >
                    <Link to={getRoutePath('recorder')}>
                      <PlusIcon />
                    </Link>
                  </IconButton>
                </Tooltip>
              </>
            }
            onCollapseSidebar={onCollapseSidebar}
          />
          <SidebarFileList
            isEmpty={isEmpty.recordings}
            files={recordings}
            searchTerm={searchTerm}
            placeholder="Search recordings..."
            noFilesMessage="No recordings found"
            emptyMessage="Capture HTTP traffic and browser events to start building tests."
            emptyAction={
              <Button asChild size="1" variant="ghost">
                <Link to={getRoutePath('recorder')}>
                  <PlusIcon /> Start recording
                </Link>
              </Button>
            }
            onSearchChange={setSearchTerm}
          />
        </Flex>
      </Panel>
      <Separator />
      <SidebarHeader
        icon={<HistoryIcon />}
        title="Recent URLs"
        variant="secondary"
      />
      <Panel
        collapsible
        minSize={100}
        defaultSize="30%"
        id="sidebar-record-tab-recent-urls"
      >
        <RecentURLsPanel />
      </Panel>
    </Group>
  )
}
