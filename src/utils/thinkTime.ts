import { FixedTiming } from '@/types/testOptions'

export const createFixedTiming = (
  value: number | null = null
): FixedTiming => ({
  type: 'fixed',
  value,
})
