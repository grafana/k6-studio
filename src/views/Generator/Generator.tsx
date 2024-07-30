import { Allotment } from 'allotment'
import { Button } from '@radix-ui/themes'

import { useSetWindowTitle } from '@/hooks/useSetWindowTitle'
import {
  useGeneratorStore,
  selectHasRecording,
  selectFilteredRequests,
} from '@/store/generator'
import { exportScript, saveGenerator, loadGenerator } from './Generator.utils'
import { GeneratorDrawer } from './GeneratorDrawer'
import { GeneratorSidebar } from './GeneratorSidebar'

import { TestRuleContainer } from './TestRuleContainer'
import { Allowlist } from './Allowlist'
import { RecordingSelector } from './RecordingSelector'
import { View } from '@/components/Layout/View'
import { useGeneratorView } from './Generator.hooks'

export function Generator() {
  const name = useGeneratorStore((store) => store.name)
  const filteredRequests = useGeneratorStore(selectFilteredRequests)
  const hasRecording = useGeneratorStore(selectHasRecording)
  const { loading } = useGeneratorView()
  useSetWindowTitle(name)

  return (
    <View
      title="Generator"
      actions={
        <>
          <RecordingSelector />
          <Allowlist />
          <Button onClick={() => saveGenerator()}>Save</Button>
          <Button onClick={() => loadGenerator()}>Load</Button>
          {hasRecording && (
            <Button onClick={exportScript}>Export script</Button>
          )}
        </>
      }
      loading={loading}
    >
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
        <Allotment.Pane minSize={300} visible={hasRecording}>
          <GeneratorSidebar requests={filteredRequests} />
        </Allotment.Pane>
      </Allotment>
    </View>
  )
}
