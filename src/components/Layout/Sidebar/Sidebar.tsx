import { css } from '@emotion/react'
import { HomeIcon } from '@radix-ui/react-icons'
import { Box, Flex, Heading, IconButton, ScrollArea } from '@radix-ui/themes'
import { Link, useNavigate } from 'react-router-dom'

import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { FileTree } from '@/components/FileTree'
import { useFolderContent } from './Sidebar.hooks'
import { loadGenerator } from '@/views/Generator/Generator.utils'

export function Sidebar() {
  const { recordings, generators, scripts } = useFolderContent()
  const navigate = useNavigate()

  const handleOpenGenerator = (path: string) => {
    loadGenerator(path)
    navigate('/generator')
  }

  return (
    <Box
      p="2"
      css={css`
        background-color: var(--gray-2);
        height: 100%;
        max-height: 100%;
        max-width: 100%;
        overflow: hidden;
      `}
    >
      <Flex gap="2" align="center" mb="2">
        <IconButton asChild aria-label="Home" variant="ghost">
          <Link to="/">
            <HomeIcon width="18" height="18" />
          </Link>
        </IconButton>
        <Heading
          size="3"
          css={css`
            flex-grow: 1;
          `}
        >
          k6 Studio
        </Heading>
        <ThemeSwitcher />
      </Flex>
      <ScrollArea scrollbars="vertical">
        <Flex direction="column" gap="2">
          <FileTree
            label="Recordings"
            files={recordings}
            noFilesMessage="No recordings found"
          />
          <FileTree
            label="Test generators"
            files={generators}
            onOpenFile={handleOpenGenerator}
            noFilesMessage="No generators found"
          />
          <FileTree
            label="Scripts"
            files={scripts}
            noFilesMessage="No scripts found"
          />
        </Flex>
      </ScrollArea>
    </Box>
  )
}
