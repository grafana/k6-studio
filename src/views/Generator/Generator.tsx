import { Allotment } from 'allotment'
import { Button } from '@radix-ui/themes'
import { useEffect } from 'react'

import { exportScript, saveScript, getLoadProfile } from './Generator.utils'
import { PageHeading } from '@/components/Layout/PageHeading'
import { harToProxyData } from '@/utils/harToProxyData'
import { GeneratorDrawer } from './GeneratorDrawer'
import { GeneratorSidebar } from './GeneratorSidebar'
import { useGeneratorStore } from '@/hooks/useGeneratorStore'
import { TestRuleContainer } from './TestRuleContainer'
import { AllowList } from './AllowList/AllowList'

export function Generator() {
  const { rules, setRecording, resetRecording, filteredRequests } =
    useGeneratorStore()

  const hasRecording = filteredRequests.length > 0

  useEffect(() => {
    return () => {
      resetRecording()
    }
  }, [resetRecording])

  const handleImport = async () => {
    const har = await window.studio.har.openFile()
    if (!har) return

    const proxyData = harToProxyData(har)
    setRecording(proxyData)
  }

  const handleExport = async () => {
    const script = await exportScript(filteredRequests, rules)

    saveScript(script)
  }

  const generatorState = useGeneratorStore()
  const saveGenerator = async () => {
    const loadProfile = getLoadProfile(generatorState)
    console.log(loadProfile)
  }

  return (
    <>
      <PageHeading text="Generator">
        <Button onClick={saveGenerator}>Save</Button>
        <Button onClick={handleImport}>Import HAR</Button>
        <AllowList />
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
          <GeneratorSidebar requests={filteredRequests} />
        </Allotment.Pane>
      </Allotment>
    </>
  )
}
