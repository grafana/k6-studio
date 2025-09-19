import { css } from '@emotion/react'
import { Flex, IconButton } from '@radix-ui/themes'
import { PanelLeftOpenIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useLocalStorage } from 'react-use'

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

  const sidebarRef = useRef<ImperativePanelHandle>(null)

  const [isSidebarExpanded, setIsSidebarExpanded] = useLocalStorage(
    'isSidebarExpanded',
    true
  )

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
            onClick={() => sidebarRef.current?.expand()}
            css={css`
              position: absolute;
              top: var(--space-4);
              right: calc(var(--space-2) * -1);
              background-color: var(--color-background);
              z-index: 10000;
            `}
          >
            <PanelLeftOpenIcon />
          </IconButton>
        )}
      </div>
      <PanelGroup direction="horizontal" autoSaveId="main-layout">
        <Panel
          ref={sidebarRef}
          collapsible
          minSize={11}
          maxSize={16}
          onCollapse={() => setIsSidebarExpanded(false)}
          onExpand={() => setIsSidebarExpanded(true)}
        >
          <Sidebar
            isExpanded={isSidebarExpanded}
            onCollapseSidebar={() => sidebarRef.current?.collapse()}
          />
        </Panel>
        <PanelResizeHandle />
        <Panel defaultSize={85}>
          <Outlet />
        </Panel>
      </PanelGroup>
    </Flex>
  )
}
