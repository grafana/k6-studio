import { Allotment } from 'allotment'
import { Outlet } from 'react-router-dom'

import { useGeneratorStore, selectHasRecording } from '@/store/generator'
import { View } from '@/components/Layout/View'
import { GeneratorSidebar } from './GeneratorSidebar'
import { TestRuleContainer } from './TestRuleContainer'
import { useGeneratorFile } from './Generator.hooks'
import { GeneratorControls } from './GeneraterControls'

export function Generator() {
  const hasRecording = useGeneratorStore(selectHasRecording)
  const { isLoading, onSave } = useGeneratorFile()

  return (
    <View
      title="Generator"
      actions={<GeneratorControls onSave={onSave} isLoading={isLoading} />}
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
