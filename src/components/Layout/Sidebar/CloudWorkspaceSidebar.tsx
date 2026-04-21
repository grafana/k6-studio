import { css } from '@emotion/react'
import * as Collapsible from '@radix-ui/react-collapsible'
import {
  Box,
  Flex,
  IconButton,
  Reset,
  ScrollArea,
  Spinner,
  Text,
  Tooltip,
} from '@radix-ui/themes'
import { ChevronRight, PanelLeftCloseIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'

import {
  type CloudWorkspaceTestEntry,
  type CloudWorkspaceTree,
  formatCloudTestRef,
} from '@/handlers/cloudWorkspace/types'
import { getRoutePath } from '@/routeMap'

const testLinkCss = css`
  display: block;
  padding: var(--space-1) var(--space-2) var(--space-1) var(--space-5);
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
`

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
  const [openByProject, setOpenByProject] = useState<Record<number, boolean>>(
    {}
  )
  const [testsByProject, setTestsByProject] = useState<
    Record<number, CloudWorkspaceTestEntry[]>
  >({})
  const [testsErrorByProject, setTestsErrorByProject] = useState<
    Record<number, string | undefined>
  >({})
  const [loadingByProject, setLoadingByProject] = useState<
    Record<number, boolean>
  >({})

  const loadedProjectIdsRef = useRef<Set<number>>(new Set())
  const fetchInFlightRef = useRef<Set<number>>(new Set())

  const loadTree = useCallback(() => {
    window.studio.cloudWorkspace
      .getTree()
      .then((data) => {
        setError(null)
        setTree(data)
        setTestsByProject({})
        setTestsErrorByProject({})
        setOpenByProject({})
        setLoadingByProject({})
        loadedProjectIdsRef.current = new Set()
        fetchInFlightRef.current = new Set()
      })
      .catch((err: unknown) => {
        setTree(null)
        setError(
          err instanceof Error ? err.message : 'Failed to load cloud tests.'
        )
      })
  }, [])

  useEffect(() => {
    loadTree()
  }, [loadTree])

  const loadTestsForProject = useCallback(async (projectId: number) => {
    if (loadedProjectIdsRef.current.has(projectId)) {
      return
    }

    if (fetchInFlightRef.current.has(projectId)) {
      return
    }

    fetchInFlightRef.current.add(projectId)
    setLoadingByProject((prev) => ({ ...prev, [projectId]: true }))
    setTestsErrorByProject((prev) => {
      const next = { ...prev }
      delete next[projectId]

      return next
    })

    try {
      const tests =
        await window.studio.cloudWorkspace.listProjectTests(projectId)
      loadedProjectIdsRef.current.add(projectId)
      setTestsByProject((prev) => ({ ...prev, [projectId]: tests }))
    } catch (err: unknown) {
      setTestsErrorByProject((prev) => ({
        ...prev,
        [projectId]:
          err instanceof Error ? err.message : 'Failed to load tests.',
      }))
    } finally {
      fetchInFlightRef.current.delete(projectId)
      setLoadingByProject((prev) => {
        const next = { ...prev }
        delete next[projectId]

        return next
      })
    }
  }, [])

  const handleProjectOpenChange = useCallback(
    (projectId: number, open: boolean) => {
      setOpenByProject((prev) => ({ ...prev, [projectId]: open }))
      if (open) {
        void loadTestsForProject(projectId)
      }
    },
    [loadTestsForProject]
  )

  const projectCount = tree?.projects.length ?? 0

  const stackSubtitle = useMemo(() => {
    if (tree === null) {
      return null
    }

    return `${tree.stackName} (${projectCount} ${
      projectCount === 1 ? 'project' : 'projects'
    })`
  }, [tree, projectCount])

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
          {stackSubtitle && (
            <Text size="1" color="gray" mx="2" mb="1">
              {stackSubtitle}
            </Text>
          )}
          <Flex direction="column" gap="1" px="1" pb="2">
            {tree &&
              tree.projects.map((project) => {
                const open = openByProject[project.projectId] ?? false
                const loaded = project.projectId in testsByProject
                const tests = testsByProject[project.projectId]
                const testsError = testsErrorByProject[project.projectId]
                const isLoading = loadingByProject[project.projectId] === true

                return (
                  <Collapsible.Root
                    key={project.projectId}
                    open={open}
                    onOpenChange={(next) =>
                      handleProjectOpenChange(project.projectId, next)
                    }
                    asChild
                  >
                    <Box
                      css={css`
                        &[data-state='open'] .cloud-project-chevron {
                          transform: rotate(90deg);
                        }
                      `}
                    >
                      <Flex align="center" gap="2" width="100%" pl="1" pt="1">
                        <Collapsible.Trigger asChild>
                          <Reset>
                            <button type="button">
                              <Flex align="center" gap="1" minWidth="0">
                                <Box flexShrink="0">
                                  <ChevronRight
                                    className="cloud-project-chevron"
                                    css={css`
                                      flex-shrink: 0;
                                      transition: transform 0.15s ease;
                                    `}
                                  />
                                </Box>
                                <Text
                                  size="2"
                                  css={css`
                                    flex-grow: 1;
                                    font-weight: 600;
                                    font-size: 12px;
                                    text-align: left;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                    white-space: nowrap;
                                  `}
                                  title={project.name}
                                >
                                  {project.name}
                                  {loaded && tests !== undefined
                                    ? ` (${tests.length})`
                                    : ''}
                                </Text>
                              </Flex>
                            </button>
                          </Reset>
                        </Collapsible.Trigger>
                      </Flex>
                      <Collapsible.Content>
                        {isLoading && (
                          <Flex align="center" justify="center" py="3">
                            <Spinner />
                          </Flex>
                        )}
                        {!isLoading && testsError !== undefined && (
                          <Box px="2" py="2">
                            <Text size="1" color="red">
                              {testsError}
                            </Text>
                          </Box>
                        )}
                        {!isLoading &&
                          loaded &&
                          tests !== undefined &&
                          testsError === undefined && (
                            <ul
                              css={css`
                                list-style: none;
                                padding: 0;
                                margin: var(--space-1) 0 0;
                              `}
                            >
                              {tests.map((t) => {
                                const ref = formatCloudTestRef(
                                  t.projectId,
                                  t.testId
                                )
                                const to = getRoutePath('cloudWorkspaceTest', {
                                  ref: encodeURIComponent(ref),
                                })

                                return (
                                  <li key={ref}>
                                    <Tooltip
                                      content={t.name}
                                      side="right"
                                      sideOffset={12}
                                    >
                                      <NavLink to={to} css={testLinkCss}>
                                        {t.name}.js
                                      </NavLink>
                                    </Tooltip>
                                  </li>
                                )
                              })}
                              {tests.length === 0 && (
                                <Box px="2" py="1">
                                  <Text size="1" color="gray">
                                    No tests in this project.
                                  </Text>
                                </Box>
                              )}
                            </ul>
                          )}
                      </Collapsible.Content>
                    </Box>
                  </Collapsible.Root>
                )
              })}
            {tree && tree.projects.length === 0 && (
              <Box px="2" py="1">
                <Text size="1" color="gray">
                  No projects in this stack.
                </Text>
              </Box>
            )}
          </Flex>
        </ScrollArea>
      </Flex>
    </Box>
  )
}
