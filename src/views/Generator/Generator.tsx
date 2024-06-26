import { useState } from 'react'
import { Box, Button, Flex, ScrollArea, TextField } from '@radix-ui/themes'

import { GroupedProxyData } from '@/types'
import { exportScript, saveScript } from './Generator.utils'
import { PageHeading } from '@/components/Layout/PageHeading'
import { harToGroupedProxyData } from '@/utils/harToProxyData'
import { WebLogView } from '@/components/WebLogView'

export function Generator() {
  const [requests, setRequests] = useState<GroupedProxyData>({})
  const [filter, setFilter] = useState('')
  const hasRecording = Object.entries(requests).length > 0

  const handleImport = async () => {
    const har = await window.studio.har.openFile()
    if (!har) return

    const groupedProxyData = harToGroupedProxyData(har)
    setRequests(groupedProxyData)
  }

  const handleExport = async () => {
    const script = await exportScript(
      requests,
      [
        {
          type: 'customCode',
          filter: { path: '' },
          snippet: 'console.log("Hello, world!")',
          placement: 'before',
        },
      ],
      [filter]
    )

    saveScript(script)
  }

  return (
    <>
      <PageHeading text="Generator">
        <Button onClick={handleImport}>Import HAR</Button>
        <Button onClick={handleExport} disabled={!hasRecording}>
          Export script
        </Button>
      </PageHeading>
      <Flex gap="2" flexGrow="1" minHeight="0">
        <Flex direction="column" flexGrow="1">
          <Box
            p="2"
            flexBasis="70%"
            style={{
              backgroundColor: 'var(--gray-4)',
              borderRadius: 'var(--radius-2)',
            }}
          >
            Rules:
          </Box>
          <Box
            p="2"
            flexGrow="1"
            style={{
              backgroundColor: 'var(--gray-4)',
              borderRadius: 'var(--radius-2)',
            }}
          >
            Filters:
            <TextField.Root
              id="group"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Allow requests containing..."
            />
          </Box>
        </Flex>
        <Flex
          p="2"
          direction="column"
          width="30%"
          style={{
            backgroundColor: 'var(--gray-4)',
            borderRadius: 'var(--radius-2)',
          }}
        >
          Requests:
          <ScrollArea scrollbars="vertical">
            <WebLogView requests={requests} />
          </ScrollArea>
        </Flex>
      </Flex>
    </>
  )
}
