import { Allotment } from 'allotment'
import { useEffect, useState } from 'react'
import { useBlocker } from 'react-router-dom'
import { Box, ScrollArea } from '@radix-ui/themes'

import {
  useGeneratorStore,
  selectGeneratorData,
  selectSelectedRule,
} from '@/store/generator'
import { View } from '@/components/Layout/View'
import { GeneratorSidebar } from './GeneratorSidebar'
import { TestRuleContainer } from './TestRuleContainer'
import {
  useGeneratorParams,
  useIsGeneratorDirty,
  useGeneratorFile,
  useSaveGeneratorFile,
} from './Generator.hooks'
import { GeneratorControls } from './GeneratorControls'
import { UnsavedChangesDialog } from './UnsavedChangesDialog'
import { RuleEditor } from './RuleEditor'
import { getFileNameWithoutExtension } from '@/utils/file'

export function Generator() {
  const selectedRule = useGeneratorStore(selectSelectedRule)

  const { fileName } = useGeneratorParams()

  const { isLoading } = useGeneratorFile(fileName)

  const { mutateAsync: saveGenerator } = useSaveGeneratorFile(fileName)

  const isDirty = useIsGeneratorDirty(fileName)

  const [isAppClosing, setIsAppClosing] = useState(false)

  const blocker = useBlocker(({ historyAction }) => {
    // Don't block navigation when redirecting home from invalid generator
    // TODO(router): Action enum is not exported from react-router-dom
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    return isDirty && historyAction !== 'REPLACE'
  })

  useEffect(() => {
    return window.studio.app.onApplicationClose(() => {
      if (isDirty || blocker.state === 'blocked') {
        setIsAppClosing(true)
        return
      }
      window.studio.app.closeApplication()
    })
  })

  const handleSaveGenerator = () => {
    const generator = selectGeneratorData(useGeneratorStore.getState())
    return saveGenerator(generator)
  }

  const handleSaveGeneratorDialog = async () => {
    await handleSaveGenerator()
    if (isAppClosing) {
      return window.studio.app.closeApplication()
    }
    blocker.proceed?.()
  }

  const handleDiscardGeneratorDialog = () => {
    if (isAppClosing) {
      return window.studio.app.closeApplication()
    }
    blocker.proceed?.()
  }

  const handleCancelGeneratorDialog = () => {
    if (isAppClosing) {
      return window.studio.app.closeApplication()
    }
    blocker.reset?.()
  }

  return (
    <View
      title="Generator"
      subTitle={getFileNameWithoutExtension(fileName)}
      actions={
        <GeneratorControls onSave={handleSaveGenerator} isDirty={isDirty} />
      }
      loading={isLoading}
    >
      <Allotment defaultSizes={[3, 2]}>
        <Allotment.Pane minSize={400}>
          <Allotment vertical defaultSizes={[1, 1]}>
            <Allotment.Pane minSize={300}>
              <TestRuleContainer />
            </Allotment.Pane>
            <Allotment.Pane minSize={300} visible={selectedRule !== undefined}>
              {selectedRule !== undefined && (
                <ScrollArea scrollbars="vertical">
                  <Box p="3">
                    <RuleEditor rule={selectedRule} />
                  </Box>
                </ScrollArea>
              )}
            </Allotment.Pane>
          </Allotment>
        </Allotment.Pane>
        <Allotment.Pane minSize={400}>
          <GeneratorSidebar />
        </Allotment.Pane>
      </Allotment>
      <UnsavedChangesDialog
        open={blocker.state === 'blocked' || (isAppClosing && isDirty)}
        onSave={handleSaveGeneratorDialog}
        onDiscard={handleDiscardGeneratorDialog}
        onCancel={handleCancelGeneratorDialog}
      />
    </View>
  )
}
