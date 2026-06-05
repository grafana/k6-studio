import { Flex, Box } from '@radix-ui/themes'
import { CirclePlusIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { ButtonWithTooltip } from '@/components/ButtonWithTooltip'
import { EmptyMessage } from '@/components/EmptyMessage'
import { Group, Panel, Separator } from '@/components/primitives/ResizablePanel'
import { HttpRequestDetails } from '@/components/WebLogView/HttpRequestDetails'
import { ProxyData, Group as GroupType } from '@/types'

import { RequestsSection } from './RequestsSection'
import { RecorderState } from './types'

interface RequestLogProps {
  recorderState?: RecorderState | undefined
  requests: ProxyData[]
  groups: GroupType[]
  onUpdateGroup?: (group: GroupType) => void
  onCreateGroup?: (name: string) => void
  onResetRecording?: () => void
}

export function RequestLog({
  recorderState,
  requests,
  groups,
  onUpdateGroup,
  onResetRecording,
  onCreateGroup,
}: RequestLogProps) {
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)

  const noDataElement = useMemo(() => {
    if (recorderState === undefined) {
      return <EmptyMessage message="The recording is empty" />
    }

    if (recorderState === 'starting') {
      return <EmptyMessage message="Requests will appear here" />
    }
  }, [recorderState])

  return (
    <Group>
      <Panel id="requests" minSize={200}>
        <Flex direction="column" height="100%">
          <div css={{ flexGrow: 0, minHeight: 0 }}>
            <RequestsSection
              proxyData={requests}
              noDataElement={noDataElement}
              selectedRequestId={selectedRequest?.id}
              autoScroll={recorderState !== undefined}
              groups={groups}
              onSelectRequest={setSelectedRequest}
              onUpdateGroup={onUpdateGroup}
              resetProxyData={onResetRecording}
            />
          </div>
          {recorderState === 'recording' && (
            <Box width="200px" p="2">
              <ButtonWithTooltip
                size="2"
                variant="ghost"
                ml="2"
                onClick={() => onCreateGroup?.(`Group ${groups.length}`)}
                tooltip="Groups are used to organize specific steps in your recording. After you create a group, any further requests will be added to it."
              >
                <CirclePlusIcon />
                Create group
              </ButtonWithTooltip>
            </Box>
          )}
        </Flex>
      </Panel>
      {selectedRequest && (
        <>
          <Separator />
          <Panel id="details" defaultSize="40%" minSize={300}>
            <HttpRequestDetails
              selectedRequest={selectedRequest}
              onSelectRequest={setSelectedRequest}
            />
          </Panel>
        </>
      )}
    </Group>
  )
}
