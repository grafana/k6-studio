import { z } from 'zod'

import { exhaustive } from '../../utils/typescript'

import * as RecordingV1 from './v1/recording'
import * as RecordingV2 from './v2/recording'

export * from './v2/browser'

type AnyRecording = RecordingV1.Recording | RecordingV2.Recording

const AnyRecordingSchema = z.unknown().transform((data): AnyRecording => {
  const v2Result = RecordingV2.RecordingSchema.safeParse(data)
  if (v2Result.success) {
    return v2Result.data
  }

  const v1Result = RecordingV1.RecordingSchema.safeParse(data)
  if (v1Result.success) {
    return v1Result.data
  }

  throw new z.ZodError(v2Result.error.issues)
})

function migrate(recording: AnyRecording): RecordingV2.Recording {
  if (
    recording.log._browserEvents &&
    typeof recording.log._browserEvents === 'object' &&
    'version' in recording.log._browserEvents
  ) {
    switch (recording.log._browserEvents.version) {
      case '2':
        return recording as RecordingV2.Recording
      // Future versions would be handled here
      default:
        return exhaustive(recording.log._browserEvents.version)
    }
  }

  return RecordingV1.migrate(recording as RecordingV1.Recording)
}

export const RecordingSchema = AnyRecordingSchema.transform(migrate)
export type Recording = RecordingV2.Recording
