import { useState } from 'react'
import { Flex, Heading, ScrollArea } from '@radix-ui/themes'
import { WebLogView } from '@/components/WebLogView'
import { GroupForm } from './GroupForm'
import { proxyDataToHar } from '@/utils/proxyDataToHar'
import { DebugControls } from './DebugControls'
import { RecordingButton } from './RecordingButton'
import { SaveHarDialog } from './SaveHarDialog'
import { useListenProxyData } from '@/hooks/useListenProxyData'
import { PageHeading } from '@/components/Layout/PageHeading'
import { groupBy } from 'lodash-es'

export function Recorder() {
  const [group, setGroup] = useState<string>('Default')
  const [showHarSaveDialog, setShowHarSaveDialog] = useState(false)
  const { proxyData, resetProxyData } = useListenProxyData(group)
  const groupedProxyData = groupBy(proxyData, 'group')

  function saveHarToFile() {
    const har = proxyDataToHar(groupedProxyData)
    window.studio.har.saveFile(JSON.stringify(har, null, 4))
  }

  return (
    <>
      <PageHeading text="Recorder">
        <RecordingButton
          onStop={() => setShowHarSaveDialog(true)}
          onStart={resetProxyData}
        />
      </PageHeading>
      <Flex justify="between" wrap="wrap" gap="2">
        <GroupForm onChange={setGroup} value={group} />

        <Flex justify="start" align="end" direction="column" gap="2">
          <DebugControls />
        </Flex>
      </Flex>
      <Heading my="4">Requests</Heading>
      <ScrollArea scrollbars="vertical">
        <WebLogView requests={groupedProxyData} />
      </ScrollArea>
      <SaveHarDialog
        onConfirm={saveHarToFile}
        open={showHarSaveDialog}
        onOpenChange={setShowHarSaveDialog}
      />
    </>
  )
}
