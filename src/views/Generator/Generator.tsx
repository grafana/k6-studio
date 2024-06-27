import { useState } from 'react'
import { Box, Button } from '@radix-ui/themes'

import { GroupedProxyData } from '@/types'
import { exportScript, saveScript } from './Generator.utils'
import { PageHeading } from '@/components/Layout/PageHeading'
import { harToGroupedProxyData } from '@/utils/harToProxyData'
import { GeneratorDrawer } from './GeneratorDrawer'
import { Allotment } from 'allotment'
import { GeneratorSidebar } from './GeneratorSidebar'

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
      <Allotment defaultSizes={[3, 1]}>
        <Allotment.Pane minSize={400}>
          <Allotment vertical defaultSizes={[2, 1]}>
            <Allotment.Pane>
              <Box height="100%">Rules:</Box>
            </Allotment.Pane>
            <Allotment.Pane>
              <GeneratorDrawer filter={filter} onFilterChange={setFilter} />
            </Allotment.Pane>
          </Allotment>
        </Allotment.Pane>
        <Allotment.Pane minSize={300}>
          <GeneratorSidebar requests={requests} />
        </Allotment.Pane>
      </Allotment>
    </>
  )
}
