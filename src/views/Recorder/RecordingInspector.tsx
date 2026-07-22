import { css } from '@emotion/react'

import { BrowserEvent } from '@/schemas/recording'
import { Group, ProxyData } from '@/types'

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
    display: flex;
    flex-direction: column;
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
    <div css={styles.content}>
      <RequestLog
        recorderState={recorderState}
        groups={groups}
        requests={requests}
        browserEvents={browserEvents}
        onCreateGroup={onCreateGroup}
        onUpdateGroup={onUpdateGroup}
        onResetRecording={onResetRecording}
      />
    </div>
  )
}
