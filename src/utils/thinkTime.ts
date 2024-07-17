import { FixedTiming } from '@/schemas/testOptions'

export const createFixedTiming = (
  value: number | null = null
): FixedTiming => ({
  type: 'fixed',
  value,
})
