import { ButtonWithTooltip } from '@/components/ButtonWithTooltip'
import { Details } from '@/components/WebLogView/Details'
import { PlusCircledIcon } from '@radix-ui/react-icons'
import { Flex, Box } from '@radix-ui/themes'
import { Allotment } from 'allotment'
import { RequestsSection } from './RequestsSection'
import { RecorderState } from './types'
import { ProxyData, Group } from '@/types'
import { EmptyState } from './EmptyState'
import { useMemo, useState } from 'react'
import { EmptyMessage } from '@/components/EmptyMessage'

interface PreviewRequestLogProps {
  recorderState?: undefined
  requests: ProxyData[]
  groups: Group[]
  group?: never
  onUpdateGroup?: never
  onResetRecording?: never
  onCreateGroup?: never
  onStartRecording?: never
}

interface RecorderRequestLogProps {
  recorderState: RecorderState
  requests: ProxyData[]
  groups: Group[]
  group: Group | undefined
  onUpdateGroup: (group: Group) => void
  onResetRecording: () => void
  onCreateGroup: (name: string) => void
  onStartRecording: (url?: string) => void
}

type RequestLogProps = PreviewRequestLogProps | RecorderRequestLogProps

export function RequestLog({
  recorderState,
  requests,
  groups,
  group,
  onUpdateGroup,
  onResetRecording,
  onCreateGroup,
  onStartRecording,
}: RequestLogProps) {
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)

  const isLoading = recorderState === 'starting' || recorderState === 'saving'

  const noDataElement = useMemo(() => {
    if (recorderState === undefined) {
      return <EmptyMessage message="The recording is empty" />
    }

    if (recorderState === 'idle') {
      return <EmptyState isLoading={isLoading} onStart={onStartRecording} />
    }

    if (recorderState === 'starting') {
      return <EmptyMessage message="Requests will appear here" />
    }
  }, [recorderState, isLoading, onStartRecording])

  return (
    <Allotment defaultSizes={[1, 1]}>
      <Allotment.Pane minSize={200}>
        <Flex direction="column" height="100%">
          <div css={{ flexGrow: 0, minHeight: 0 }}>
            <RequestsSection
              proxyData={requests}
              noDataElement={noDataElement}
              selectedRequestId={selectedRequest?.id}
              autoScroll={recorderState !== undefined}
              groups={groups}
              activeGroup={group?.id}
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
                onClick={() => onCreateGroup(`Group ${groups.length}`)}
                tooltip="Groups are used to organize specific steps in your recording. After you create a group, any further requests will be added to it."
              >
                <PlusCircledIcon />
                Create group
              </ButtonWithTooltip>
            </Box>
          )}
        </Flex>
      </Allotment.Pane>
      <Allotment.Pane minSize={300} visible={selectedRequest !== null}>
        {selectedRequest !== null && (
          <Details
            selectedRequest={selectedRequest}
            onSelectRequest={setSelectedRequest}
          />
        )}
      </Allotment.Pane>
    </Allotment>
  )
}
