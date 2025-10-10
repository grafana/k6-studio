import { z } from 'zod'

import * as RecordingV1 from './v1/recording'
import * as RecordingV2 from './v2/recording'

export * from './v2/browser'

const AnyRecordingSchema = z.union([
  RecordingV1.RecordingSchema,
  RecordingV2.RecordingSchema,
])

export function migrate(recording: z.infer<typeof AnyRecordingSchema>) {
  if (
    recording.log._browserEvents &&
    'version' in recording.log._browserEvents &&
    recording.log._browserEvents.version === '2'
  ) {
    return recording as RecordingV2.Recording
  }

  return RecordingV1.migrate(recording as RecordingV1.Recording)
}

export const RecordingSchema = AnyRecordingSchema.transform(migrate)
export type Recording = RecordingV2.Recording
