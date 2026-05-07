import { css } from '@emotion/react'
import { Box, Flex, Spinner } from '@radix-ui/themes'
import { Suspense, useCallback, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useLocalStorage } from 'react-use'

import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
  usePanelRef,
} from '@/components/primitives/ResizablePanel'
import { useDelayedVisibility } from '@/hooks/useDelayedVisibility'
import { useListenDeepLinks } from '@/hooks/useListenDeepLinks'
import { useWatchFileChanges } from '@/hooks/useWatchFileChanges'

import { ActivityBar } from './ActivityBar'
import { SidebarTab } from './Layout.types'
import { Sidebar } from './Sidebar'

function RouteLoadingFallback() {
  const showSpinner = useDelayedVisibility()

  return (
    <Flex
      align="center"
      justify="center"
      css={css`
        width: 100%;
        height: 100%;
      `}
    >
      {showSpinner && <Spinner />}
    </Flex>
  )
}

export function Layout() {
  const [activeTab = 'record', setActiveTab] = useLocalStorage<SidebarTab>(
    'activeTab',
    'record'
  )
  const sidebarRef = usePanelRef()
  const location = useLocation()
  useListenDeepLinks()
  useWatchFileChanges()

  const layout = useDefaultLayout({
    groupId: 'sidebar-layout',
    storage: localStorage,
  })

  const handleTabChange = useCallback(
    (tab: SidebarTab) => {
      setActiveTab(tab)
      sidebarRef.current?.expand()
    },
    [setActiveTab, sidebarRef]
  )

  const handleCollapseSidebar = useCallback(() => {
    sidebarRef.current?.collapse()
  }, [sidebarRef])

  useEffect(() => {
    window.studio.app.changeRoute(location.pathname)
  }, [location.pathname])

  return (
    <Flex height="100dvh">
      <Group
        {...layout}
        id="sidebar-layout"
        css={css`
          --focus-border: var(--accent-9);
        `}
      >
        <Box
          flexShrink="0"
          css={{
            width: '64px',
          }}
        >
          <ActivityBar activeTab={activeTab} onTabChange={handleTabChange} />
        </Box>
        <Separator />
        <Panel
          panelRef={sidebarRef}
          collapsible
          collapsedSize="0px"
          minSize="200px"
          maxSize="300px"
          defaultSize="280px"
          id="sidebar-panel"
        >
          <Sidebar
            activeTab={activeTab}
            onCollapseSidebar={handleCollapseSidebar}
          />
        </Panel>
        <Separator />
        <Panel id="main-panel" style={{ position: 'relative', zIndex: 0 }}>
          <Suspense fallback={<RouteLoadingFallback />}>
            <Outlet />
          </Suspense>
        </Panel>
      </Group>
    </Flex>
  )
}
