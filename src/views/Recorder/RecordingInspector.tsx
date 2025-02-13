import { Tabs } from '@radix-ui/themes'
import { RequestLog } from './RequestLog'
import { Group, ProxyData } from '@/types'
import { BrowserEvent } from '@/schemas/recording'
import { RecorderState } from './types'
import { BrowserEventLog } from './BrowserEventLog'
import { css } from '@emotion/react'

interface RecordingInspectorProps {
  recorderState?: RecorderState
  groups: Group[]
  requests: ProxyData[]
  browserEvents: BrowserEvent[]
  onUpdateGroup?: (group: Group) => void
  onCreateGroup?: (name: string) => void
  onResetRecording?: () => void
  onExportBrowserScript?: (fileName: string) => void
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
  onExportBrowserScript,
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
          Requests ({requests.length})
        </Tabs.Trigger>
        <Tabs.Trigger value="browser-events">
          Browser events ({browserEvents.length})
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
        <BrowserEventLog
          events={browserEvents}
          onExportScript={onExportBrowserScript}
        />
      </Tabs.Content>
    </Tabs.Root>
  )
}
