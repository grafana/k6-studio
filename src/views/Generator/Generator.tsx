import { Allotment } from 'allotment'
import { Button } from '@radix-ui/themes'
import { useEffect } from 'react'

import { exportScript, saveScript } from './Generator.utils'
import { PageHeading } from '@/components/Layout/PageHeading'
import { harToGroupedProxyData } from '@/utils/harToProxyData'
import { GeneratorDrawer } from './GeneratorDrawer'
import { GeneratorSidebar } from './GeneratorSidebar'
import { useGeneratorStore } from '@/hooks/useGeneratorStore'
import { TestRuleContainer } from './TestRuleContainer'

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

  const handleExport = async () => {
    const script = await exportScript(recording, rules, requestFilters)

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
          <Allotment vertical defaultSizes={[1, 1]}>
            <Allotment.Pane minSize={300}>
              <TestRuleContainer />
            </Allotment.Pane>
            <Allotment.Pane minSize={300}>
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
