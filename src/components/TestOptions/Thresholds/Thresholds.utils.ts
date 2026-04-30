import { getLogicalOperatorLabelAndIcon } from '@/utils/operatorLabels'

export const THRESHOLD_CONDITIONS_OPTIONS = [
  { value: '<', ...getLogicalOperatorLabelAndIcon('lessThan') },
  { value: '<=', ...getLogicalOperatorLabelAndIcon('lessThanOrEqual') },
  { value: '>', ...getLogicalOperatorLabelAndIcon('greaterThan') },
  { value: '>=', ...getLogicalOperatorLabelAndIcon('greaterThanOrEqual') },
  { value: '===', ...getLogicalOperatorLabelAndIcon('equals') },
  { value: '!=', ...getLogicalOperatorLabelAndIcon('notEquals') },
]
