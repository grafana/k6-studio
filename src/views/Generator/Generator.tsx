import { Allotment } from 'allotment'
import { useEffect, useState } from 'react'
import { Button } from '@radix-ui/themes'
import { Outlet } from 'react-router-dom'

import { useSetWindowTitle } from '@/hooks/useSetWindowTitle'
import { useGeneratorStore, selectHasRecording } from '@/store/generator'
import { View } from '@/components/Layout/View'
import { exportScript, saveGenerator, loadGenerator } from './Generator.utils'
import { GeneratorSidebar } from './GeneratorSidebar'
import { TestRuleContainer } from './TestRuleContainer'
import { Allowlist } from './Allowlist'
import { RecordingSelector } from './RecordingSelector'
import { useGeneratorParams } from './Generator.hooks'
import { useToast } from '@/store/ui/useToast'

export function Generator() {
  const hasRecording = useGeneratorStore(selectHasRecording)
  const [isLoading, setIsLoading] = useState(false)
  const { fileName } = useGeneratorParams()
  useSetWindowTitle(fileName)
  const showToast = useToast()

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      try {
        await loadGenerator(fileName)
      } catch (error) {
        showToast({
          title: 'Failed to load generator: corrupted file',
          status: 'error',
        })
      } finally {
        setIsLoading(false)
      }
    })()
  }, [fileName, showToast])

  const handleSave = () => {
    saveGenerator(fileName).then(() => {
      showToast({ title: 'Generator saved', status: 'success' })
    })
  }

  return (
    <View
      title="Generator"
      actions={
        <>
          <RecordingSelector />
          <Allowlist />
          <Button onClick={handleSave}>Save</Button>
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
