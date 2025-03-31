import {
  IconBracketsContain,
  IconBracketsOff,
  IconEqual,
  IconEqualNot,
  IconMathEqualGreater,
  IconMathEqualLower,
  IconMathGreater,
  IconMathLower,
} from '@tabler/icons-react'

import { exhaustive } from './typescript'

export function getLogicalOperatorLabelAndIcon(
  operator:
    | 'equals'
    | 'notEquals'
    | 'contains'
    | 'notContains'
    | 'greaterThan'
    | 'greaterThanOrEqual'
    | 'lessThan'
    | 'lessThanOrEqual',
  iconSize = 15
) {
  switch (operator) {
    case 'equals': {
      return {
        label: 'Equal to',
        icon: <IconEqual size={iconSize} />,
      }
    }
    case 'notEquals': {
      return {
        label: 'Not equal to',
        icon: <IconEqualNot size={iconSize} />,
      }
    }
    case 'contains': {
      return {
        label: 'Contains',
        icon: <IconBracketsContain size={iconSize} />,
      }
    }
    case 'notContains': {
      return {
        label: 'Does not contain',
        icon: <IconBracketsOff size={iconSize} />,
      }
    }
    case 'greaterThan': {
      return {
        label: 'Greater than',
        icon: <IconMathGreater size={iconSize} />,
      }
    }
    case 'greaterThanOrEqual': {
      return {
        label: 'Greater than or equal to',
        icon: <IconMathEqualGreater size={iconSize} />,
      }
    }
    case 'lessThan': {
      return {
        label: 'Less than',
        icon: <IconMathLower size={iconSize} />,
      }
    }
    case 'lessThanOrEqual': {
      return {
        label: 'Less than or equal to',
        icon: <IconMathEqualLower size={iconSize} />,
      }
    }

    default: {
      return exhaustive(operator)
    }
  }
}
