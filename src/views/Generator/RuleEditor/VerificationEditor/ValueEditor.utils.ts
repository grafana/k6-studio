import {
  StatusVerificationRuleSchema,
  BodyVerificationRuleSchema,
} from '@/schemas/generator'
import { VerificationRule } from '@/types/rules'
import { getLogicalOperatorLabelAndIcon } from '@/utils/operatorLabels'
import { exhaustive } from '@/utils/typescript'

export const VALUE_LABELS: Record<VerificationRule['value']['type'], string> = {
  recordedValue: 'Recorded value',
  string: 'Text value',
  variable: 'Variable',
  number: 'Number',
}

export const OPERATOR_LABELS = {
  equals: getLogicalOperatorLabelAndIcon('equals'),
  notEquals: getLogicalOperatorLabelAndIcon('notEquals'),
  contains: getLogicalOperatorLabelAndIcon('contains'),
  notContains: getLogicalOperatorLabelAndIcon('notContains'),
}

export function getAvailableOperators(target: VerificationRule['target']) {
  switch (target) {
    case 'status':
      return StatusVerificationRuleSchema.shape.operator.options
    case 'body':
      return BodyVerificationRuleSchema.shape.operator.options
    default:
      return exhaustive(target)
  }
}

export function getAvailableValueTypes(target: VerificationRule['target']) {
  switch (target) {
    case 'status':
      return StatusVerificationRuleSchema.shape.value.options.map(
        (opt) => opt.shape.type.value
      )
    case 'body':
      return BodyVerificationRuleSchema.shape.value.options.map(
        (opt) => opt.shape.type.value
      )
    default:
      return exhaustive(target)
  }
}

export function getValueTypeOptions(
  target: VerificationRule['target'],
  hasVariables: boolean
) {
  return getAvailableValueTypes(target).map((val) => ({
    value: val,
    label: VALUE_LABELS[val],
    disabled: val === 'variable' && !hasVariables,
  }))
}

export function getOperatorOptions(target: VerificationRule['target']) {
  return getAvailableOperators(target).map((val) => ({
    value: val,
    ...OPERATOR_LABELS[val],
  }))
}
