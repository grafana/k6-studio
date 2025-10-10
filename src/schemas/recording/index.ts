import invariant from 'tiny-invariant'

import { migrate as migrateV1toV2 } from './v1/recording'
import { Recording } from './v2/recording'

export * from './v2/browser'
export { Recording } from './v2/recording'

export function parseRecording(data: string): Recording {
  const recording = JSON.parse(data) as Recording

  invariant(recording.log, 'Invalid HAR: missing log property')

  if (recording.log._browserEvents?.version === '2') {
    return recording
  }

  return migrateV1toV2(recording)
}
