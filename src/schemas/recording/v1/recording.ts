import type { Har } from 'har-format'

import type { Recording as RecordingV2 } from '../v2/recording'

export type Recording = Har

export function migrate(recording: Recording): RecordingV2 {
  return {
    ...recording,
    // @ts-expect-error FIXME: figure out a better way before merging
    log: {
      ...recording.log,
      ...(recording.log._browserEvents !== undefined && {
        _browserEvents: {
          version: '2',
          events: recording.log._browserEvents,
        },
      }),
    },
  }
}
