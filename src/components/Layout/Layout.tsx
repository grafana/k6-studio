import { css } from '@emotion/react'
import { Flex, IconButton } from '@radix-ui/themes'
import { PanelLeftOpenIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { useListenDeepLinks } from '@/hooks/useListenDeepLinks'

import {
  ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from '../ResizablePanel'

import { ActivityBar } from './ActivityBar'
import { Sidebar } from './Sidebar'

export function Layout() {
  const location = useLocation()

  const [sidebar, setSidebar] = useState<ImperativePanelHandle | null>(null)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)

  useListenDeepLinks()

  useEffect(() => {
    window.studio.app.changeRoute(location.pathname)
  }, [location])

  return (
    <Flex
      height="100dvh"
      position="relative"
      css={css`
        /* Allotment - need to keep this until fully migrated */
        --focus-border: var(--accent-9);
        --separator-border: var(--gray-5);
        --sash-hover-size: 2px;
      `}
    >
      <div
        css={css`
          position: relative;
          min-width: 64px;
          border-right: 1px solid var(--gray-5);
        `}
      >
        <ActivityBar />
        {!isSidebarExpanded && (
          <IconButton
            size="1"
            variant="ghost"
            color="gray"
            css={css`
              position: absolute;
              top: var(--space-4);
              right: calc(var(--space-2) * -1);
              background-color: var(--color-background);
              z-index: 10000;
            `}
            onClick={() => sidebar?.expand()}
          >
            <PanelLeftOpenIcon />
          </IconButton>
        )}
      </div>
      <PanelGroup direction="horizontal" autoSaveId="main-layout">
        <Panel
          ref={setSidebar}
          collapsible
          defaultSize={15}
          minSize={11}
          maxSize={16}
          onExpand={() => setIsSidebarExpanded(true)}
          onCollapse={() => setIsSidebarExpanded(false)}
        >
          <Sidebar
            isExpanded={isSidebarExpanded}
            onCollapseSidebar={() => sidebar?.collapse()}
          />
        </Panel>
        <PanelResizeHandle />
        <Panel>
          <Outlet />
        </Panel>
      </PanelGroup>
    </Flex>
  )
}
