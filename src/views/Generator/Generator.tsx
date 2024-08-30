import { Allotment } from 'allotment'
import { Button } from '@radix-ui/themes'
import { Outlet } from 'react-router-dom'

import { useGeneratorStore, selectHasRecording } from '@/store/generator'
import { View } from '@/components/Layout/View'
import { exportScript } from './Generator.utils'
import { GeneratorSidebar } from './GeneratorSidebar'
import { TestRuleContainer } from './TestRuleContainer'
import { Allowlist } from './Allowlist'
import { RecordingSelector } from './RecordingSelector'
import { useGeneratorFile } from './Generator.hooks'

export function Generator() {
  const hasRecording = useGeneratorStore(selectHasRecording)
  const { isLoading, onSave } = useGeneratorFile()

  return (
    <View
      title="Generator"
      actions={
        <>
          <RecordingSelector />
          <Allowlist />
          <Button onClick={onSave}>Save</Button>
          {hasRecording && (
            <Button onClick={exportScript}>Export script</Button>
          )}
        </>
      }
      loading={isLoading}
    >
      <Allotment defaultSizes={[3, 1]}>
        <Allotment.Pane minSize={400}>
          <Allotment vertical defaultSizes={[1, 1]}>
            <Allotment.Pane minSize={300}>
              <TestRuleContainer />
            </Allotment.Pane>
            <Allotment.Pane minSize={300}>
              <Outlet />
            </Allotment.Pane>
          </Allotment>
        </Allotment.Pane>
        <Allotment.Pane minSize={300} visible={hasRecording}>
          <GeneratorSidebar />
        </Allotment.Pane>
      </Allotment>
    </View>
  )
}
