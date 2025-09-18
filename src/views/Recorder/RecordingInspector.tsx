import { css } from '@emotion/react'
import { Badge, Tabs } from '@radix-ui/themes'
import { FlaskConical } from 'lucide-react'

import { Flex } from '@/components/primitives/Flex'
import { BrowserEvent } from '@/schemas/recording'
import { Group, ProxyData } from '@/types'

import { BrowserEventLog } from './BrowserEventLog'
import { RequestLog } from './RequestLog'
import { RecorderState } from './types'

interface RecordingInspectorProps {
  recorderState?: RecorderState
  groups: Group[]
  requests: ProxyData[]
  browserEvents: BrowserEvent[]
  onUpdateGroup?: (group: Group) => void
  onCreateGroup?: (name: string) => void
  onResetRecording?: () => void
}

const styles = {
  content: css`
    flex: 1 1 0;
    min-height: 0;
  `,
}

export function RecordingInspector({
  recorderState,
  groups,
  requests,
  browserEvents,
  onUpdateGroup,
  onCreateGroup,
  onResetRecording,
}: RecordingInspectorProps) {
  return (
    <Tabs.Root
      defaultValue="requests"
      css={css`
        flex: 1 1 0;
        display: flex;
        flex-direction: column;
      `}
    >
      <Tabs.List>
        <Tabs.Trigger value="requests">
          <Flex align="center" gap="1">
            Requests
            <Badge radius="full" color="gray" highContrast>
              {requests.length}
            </Badge>
          </Flex>
        </Tabs.Trigger>
        <Tabs.Trigger
          value="browser-events"
          disabled={browserEvents.length === 0}
        >
          <Flex align="center" gap="1">
            <FlaskConical
              css={css`
                width: 1em;
                height: 1em;
                margin-right: 0.25em;
              `}
              strokeWidth={1.5}
            />
            Browser events
            <Badge
              radius="full"
              color="gray"
              highContrast={browserEvents.length > 0}
            >
              {browserEvents.length}
            </Badge>
          </Flex>
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="requests" css={styles.content}>
        <RequestLog
          recorderState={recorderState}
          groups={groups}
          requests={requests}
          onCreateGroup={onCreateGroup}
          onUpdateGroup={onUpdateGroup}
          onResetRecording={onResetRecording}
        />
      </Tabs.Content>
      <Tabs.Content value="browser-events" css={styles.content}>
        <BrowserEventLog events={browserEvents} />
      </Tabs.Content>
    </Tabs.Root>
  )
}
