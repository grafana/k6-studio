import type { z } from 'zod'

import type {
  ThresholdConditionSchema,
  ThresholdStatisticSchema,
} from '@/schemas/generator'
import { getLogicalOperatorLabelAndIcon } from '@/utils/operatorLabels'

/** The single control a threshold row offers when rows are not removable and
 * toggleable at once. */
export type RowControl = 'toggle' | 'remove'

export interface ThresholdLikeRow {
  id: string
  metric: string
  statistic: z.infer<typeof ThresholdStatisticSchema>
  condition: z.infer<typeof ThresholdConditionSchema>
  value: number
  stopTest: boolean
  enabled: boolean
}

export const THRESHOLD_CONDITIONS_OPTIONS = [
  { value: '<', ...getLogicalOperatorLabelAndIcon('lessThan') },
  { value: '<=', ...getLogicalOperatorLabelAndIcon('lessThanOrEqual') },
  { value: '>', ...getLogicalOperatorLabelAndIcon('greaterThan') },
  { value: '>=', ...getLogicalOperatorLabelAndIcon('greaterThanOrEqual') },
  { value: '===', ...getLogicalOperatorLabelAndIcon('equals') },
  { value: '!=', ...getLogicalOperatorLabelAndIcon('notEquals') },
]
