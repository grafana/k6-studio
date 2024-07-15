export type SleepType = 'groups' | 'requests' | 'iterations'

export interface FixedTiming {
  type: 'fixed'
  value: number | null
}

export interface RangeTiming {
  type: 'range'
  value: {
    min: number | null
    max: number | null
  }
}

export type Timing = FixedTiming | RangeTiming
