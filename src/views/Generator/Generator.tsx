import { Allotment } from 'allotment'
import { Box, Button } from '@radix-ui/themes'

import { exportScript, saveScript } from './Generator.utils'
import { PageHeading } from '@/components/Layout/PageHeading'
import { harToGroupedProxyData } from '@/utils/harToProxyData'
import { GeneratorDrawer } from './GeneratorDrawer'
import { GeneratorSidebar } from './GeneratorSidebar'
import { useGeneratorStore } from '@/hooks/useGeneratorStore'
import { useEffect } from 'react'

export function Generator() {
  const { recording, requestFilters, rules, setRecording, resetRecording } =
    useGeneratorStore()
  const hasRecording = Object.entries(recording).length > 0

  useEffect(() => {
    return () => {
      resetRecording()
    }
  }, [resetRecording])

  const handleImport = async () => {
    const har = await window.studio.har.openFile()
    if (!har) return

    const groupedProxyData = harToGroupedProxyData(har)
    setRecording(groupedProxyData)
  }

  const handleValidate = async () => {
    const script = await exportScript(recording, rules, requestFilters)
  }

  const handleExport = async () => {
    const script = await exportScript(recording, rules, requestFilters)

    saveScript(script)
  }

  return (
    <>
      <PageHeading text="Generator">
        <Button onClick={handleImport}>Import HAR</Button>
        <Button onClick={handleValidate} disabled={!hasRecording}>
          Validate script
        </Button>
        <Button onClick={handleExport} disabled={!hasRecording}>
          Export script
        </Button>
      </PageHeading>
      <Allotment defaultSizes={[3, 1]}>
        <Allotment.Pane minSize={400}>
          <Allotment vertical defaultSizes={[2, 1]}>
            <Allotment.Pane minSize={300}>
              <Box height="100%">Rules:</Box>
            </Allotment.Pane>
            <Allotment.Pane minSize={200}>
              <GeneratorDrawer />
            </Allotment.Pane>
          </Allotment>
        </Allotment.Pane>
        <Allotment.Pane minSize={300}>
          <GeneratorSidebar requests={recording} />
        </Allotment.Pane>
      </Allotment>
    </>
  )
}
