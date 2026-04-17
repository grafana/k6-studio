import { css } from '@emotion/react'
import * as Collapsible from '@radix-ui/react-collapsible'
import {
  Box,
  Flex,
  IconButton,
  Reset,
  ScrollArea,
  Text,
  Tooltip,
} from '@radix-ui/themes'
import { ChevronDownIcon, ChevronRight, PanelLeftCloseIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

import {
  type CloudWorkspaceTree,
  formatCloudTestRef,
} from '@/handlers/cloudWorkspace/types'
import { getRoutePath } from '@/routeMap'
interface CloudWorkspaceSidebarProps {
  isExpanded?: boolean
  onCollapseSidebar: () => void
}

export function CloudWorkspaceSidebar({
  isExpanded,
  onCollapseSidebar,
}: CloudWorkspaceSidebarProps) {
  const [tree, setTree] = useState<CloudWorkspaceTree | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(true)

  const loadTree = useCallback(() => {
    window.studio.cloudWorkspace
      .getTree()
      .then((data) => {
        setError(null)
        setTree(data)
      })
      .catch((err: unknown) => {
        setTree(null)
        setError(err instanceof Error ? err.message : 'Failed to load cloud tests.')
      })
  }, [])

  useEffect(() => {
    loadTree()
  }, [loadTree])

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
        <Flex align="center" m="2" gap="2" justify="between">
          <Text size="1" weight="bold" color="gray" highContrast>
            Cloud workspace
          </Text>
          {isExpanded && (
            <IconButton
              size="1"
              variant="ghost"
              color="gray"
              onClick={onCollapseSidebar}
            >
              <PanelLeftCloseIcon />
            </IconButton>
          )}
        </Flex>
        {error && (
          <Text size="1" color="red" mx="2" mb="2">
            {error}
          </Text>
        )}
        <ScrollArea scrollbars="vertical">
          <Collapsible.Root open={open} onOpenChange={setOpen}>
            <Flex align="center" gap="2" width="100%" px="1" pt="1">
              <Collapsible.Trigger asChild>
                <Reset>
                  <button type="button">
                    <Flex align="center" gap="1">
                      {open ? <ChevronDownIcon /> : <ChevronRight />}
                      <Text
                        size="2"
                        css={css`
                          flex-grow: 1;
                          font-weight: 600;
                          font-size: 12px;
                          text-transform: uppercase;
                        `}
                      >
                        {tree?.stackName ?? 'Grafana Cloud'} (
                        {tree?.tests.length ?? 0})
                      </Text>
                    </Flex>
                  </button>
                </Reset>
              </Collapsible.Trigger>
            </Flex>
            <Collapsible.Content>
              <ul
                css={css`
                  list-style: none;
                  padding: 0;
                  margin: var(--space-1) 0 var(--space-2);
                `}
              >
                {tree &&
                  tree.tests.map((t) => {
                    const ref = formatCloudTestRef(t.projectId, t.testId)
                    const to = getRoutePath('cloudWorkspaceTest', {
                      ref: encodeURIComponent(ref),
                    })

                    return (
                      <li key={ref}>
                        <Tooltip content={t.name} side="right" sideOffset={12}>
                          <NavLink
                            to={to}
                            css={css`
                              display: block;
                              padding: var(--space-1) var(--space-2) var(--space-1)
                                var(--space-5);
                              font-size: 12px;
                              line-height: 22px;
                              color: var(--gray-11);
                              border-radius: 4px;
                              overflow: hidden;
                              text-overflow: ellipsis;
                              white-space: nowrap;
                              text-decoration: none;

                              &:hover {
                                background-color: var(--gray-4);
                              }

                              &.active {
                                color: var(--accent-9);
                                font-weight: 700;
                              }
                            `}
                          >
                            {t.name}.js
                          </NavLink>
                        </Tooltip>
                      </li>
                    )
                  })}
                {tree && tree.tests.length === 0 && (
                  <Box px="2" py="1">
                    <Text size="1" color="gray">
                      No tests in this stack.
                    </Text>
                  </Box>
                )}
              </ul>
            </Collapsible.Content>
          </Collapsible.Root>
        </ScrollArea>
      </Flex>
    </Box>
  )
}
