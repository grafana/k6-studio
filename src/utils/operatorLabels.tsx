import {
  TbBracketsContain,
  TbBracketsOff,
  TbEqual,
  TbEqualNot,
  TbMathEqualGreater,
  TbMathEqualLower,
  TbMathGreater,
  TbMathLower,
} from 'react-icons/tb'

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
        icon: <TbEqual size={iconSize} />,
      }
    }
    case 'notEquals': {
      return {
        label: 'Not equal to',
        icon: <TbEqualNot size={iconSize} />,
      }
    }
    case 'contains': {
      return {
        label: 'Contains',
        icon: <TbBracketsContain size={iconSize} />,
      }
    }
    case 'notContains': {
      return {
        label: 'Does not contain',
        icon: <TbBracketsOff size={iconSize} />,
      }
    }
    case 'greaterThan': {
      return {
        label: 'Greater than',
        icon: <TbMathGreater size={iconSize} />,
      }
    }
    case 'greaterThanOrEqual': {
      return {
        label: 'Greater than or equal to',
        icon: <TbMathEqualGreater size={iconSize} />,
      }
    }
    case 'lessThan': {
      return {
        label: 'Less than',
        icon: <TbMathLower size={iconSize} />,
      }
    }
    case 'lessThanOrEqual': {
      return {
        label: 'Less than or equal to',
        icon: <TbMathEqualLower size={iconSize} />,
      }
    }

    default: {
      return exhaustive(operator)
    }
  }
}
