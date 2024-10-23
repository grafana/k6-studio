import { Box, Flex, IconButton, ScrollArea, Tooltip } from '@radix-ui/themes'
import { PinLeftIcon, PlusIcon } from '@radix-ui/react-icons'
import { css } from '@emotion/react'

import { FileTree } from '@/components/FileTree'
import { useFolderContent } from './Sidebar.hooks'
import { Link } from 'react-router-dom'
import { getRoutePath } from '@/routeMap'
import { useCreateGenerator } from '@/hooks/useCreateGenerator'
import { SearchField } from '@/components/SearchField'
import { useMemo, useState } from 'react'
import Fuse from 'fuse.js'

interface SidebarProps {
  isExpanded: boolean
  onCollapseSidebar: () => void
}

export function Sidebar({ isExpanded, onCollapseSidebar }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { recordings, generators, scripts } = useFolderContent()
  const createNewGenerator = useCreateGenerator()

  const searchIndex = useMemo(() => {
    const items = [...recordings, ...generators, ...scripts]

    return new Fuse(items, {
      includeMatches: true,
      findAllMatches: false,
      useExtendedSearch: true,
      keys: ['displayName'],
    })
  }, [recordings, generators, scripts])

  const results = useMemo(() => {
    if (searchTerm.match(/^\s*$/)) {
      return []
    }

    return searchIndex.search(searchTerm).map((result) => {
      return {
        ...result.item,
        matches: result.matches?.flatMap((match) => match.indices) ?? [],
      }
    })
  }, [searchIndex, searchTerm])

  return (
    <Box
      height="100%"
      maxHeight="100%"
      maxWidth="100%"
      overflow="hidden"
      position="relative"
    >
      <Flex align="center" m="2" gap="1">
        <SearchField
          css={{ flex: '1 1 0' }}
          filter={searchTerm}
          placeholder="Find files..."
          size="1"
          onChange={setSearchTerm}
        />

        {isExpanded && (
          <IconButton
            size="1"
            css={css`
              margin-left: auto;
            `}
            variant="ghost"
            color="gray"
            onClick={onCollapseSidebar}
          >
            <PinLeftIcon />
          </IconButton>
        )}
      </Flex>
      <ScrollArea scrollbars="vertical">
        {searchTerm !== '' && (
          <FileTree
            label="Search results"
            files={results}
            noFilesMessage={`The term "${searchTerm}" did not match any files.`}
          />
        )}
        {searchTerm === '' && (
          <Flex direction="column" gap="2">
            <FileTree
              label="Recordings"
              files={recordings}
              noFilesMessage="No recordings found"
              actions={
                <>
                  <Tooltip content="New recording" side="right">
                    <IconButton
                      asChild
                      aria-label="New recording"
                      variant="ghost"
                      size="1"
                    >
                      <Link to={getRoutePath('recorder')}>
                        <PlusIcon />
                      </Link>
                    </IconButton>
                  </Tooltip>
                </>
              }
            />
            <FileTree
              label="Test generators"
              files={generators}
              noFilesMessage="No generators found"
              actions={
                <Tooltip content="New generator" side="right">
                  <IconButton
                    asChild
                    aria-label="New generator"
                    variant="ghost"
                    size="1"
                    onClick={createNewGenerator}
                    css={{ cursor: 'pointer' }}
                  >
                    <PlusIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <FileTree
              label="Scripts"
              files={scripts}
              noFilesMessage="No scripts found"
            />
          </Flex>
        )}
      </ScrollArea>
    </Box>
  )
}
