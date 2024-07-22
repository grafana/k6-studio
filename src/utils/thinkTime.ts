import { FixedTiming } from '@/types/testOptions'

export const createFixedTiming = (value = 1): FixedTiming => ({
  type: 'fixed',
  value,
})
