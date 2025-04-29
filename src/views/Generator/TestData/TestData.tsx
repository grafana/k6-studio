import { css } from '@emotion/react'
import { Box, Button, Inset, ScrollArea, Tabs } from '@radix-ui/themes'
import { ArchiveIcon } from 'lucide-react'
import { useState } from 'react'

import { PopoverDialog } from '@/components/PopoverDialogs'

import { DataFiles } from './DataFiles'
import { VariablesEditor } from './VariablesEditor'

export function TestData() {
  const [selectedTab, setSelectedTab] = useState('variables')

  return (
    <PopoverDialog
      align="center"
      width="480px"
      trigger={
        <Button variant="ghost" size="1" color="gray">
          <ArchiveIcon />
          Test data
        </Button>
      }
    >
      <Inset>
        <Tabs.Root value={selectedTab} onValueChange={setSelectedTab}>
          <Tabs.List
            css={css`
              margin-bottom: var(--space-3);
            `}
          >
            <Tabs.Trigger value="variables">Variables</Tabs.Trigger>
            <Tabs.Trigger value="dataFiles">Data files</Tabs.Trigger>
          </Tabs.List>
          <ScrollArea
            scrollbars="vertical"
            css={css`
              max-height: 60vh;
            `}
          >
            <Box p="3" pt="0" css={{ '.rt-TabsContent': { outline: 'none' } }}>
              <Tabs.Content value="variables">
                <VariablesEditor />
              </Tabs.Content>
              <Tabs.Content value="dataFiles">
                <DataFiles />
              </Tabs.Content>
            </Box>
          </ScrollArea>
        </Tabs.Root>
      </Inset>
    </PopoverDialog>
  )
}
