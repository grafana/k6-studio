import { isEqual } from 'lodash-es'

import { Exchange } from './model/types'

import {
  Correlatable,
  Correlation,
  findCorrelations as findCorrelations,
} from './correlation'
import { Selector, Patch, Variable, VariablePatch } from './types'
import { analyze } from './analysis'
import { exhaustive } from '@/utils/typescript'

interface VariableContext {
  readonly occurences: number
  readonly definitions: { readonly [index: number]: Variable[] }
}

type Environment = {
  readonly [name: string]: VariableContext
}

const emptyEnvironment: Environment = {}

const emptyContext: VariableContext = {
  occurences: 0,
  definitions: {},
}

class CorrelationError extends Error {
  from: Correlatable
  to: Correlatable

  constructor(message: string, from: Correlatable, to: Correlatable) {
    super(
      `An error occured correlating '${from.value.name}' of entry ${from.index} with entry ${to.index}. Reason: ${message}`
    )

    this.from = from
    this.to = to
  }
}

const isSameSelector = (left: Selector, right: Selector) => isEqual(left, right)

const toReference = (variable: Variable) => '${' + variable.name + '}'

const getUniqueVariableName = (
  env: Environment,
  { index, value }: Correlatable
): [Environment, Variable] => {
  const context = env[value.name] || emptyContext

  const definitions = context.definitions[index] || []
  const existing = definitions.find((v) =>
    isSameSelector(v.selector, value.selector)
  )

  if (existing) {
    return [env, existing]
  }

  const variable = {
    name: value.name + (index === 0 ? '' : context.occurences + 1),
    selector: value.selector,
  }

  const newEnv = {
    ...env,
    [value.name]: {
      occurences: context.occurences + 1,
      definitions: {
        ...context.definitions,
        [index]: [...definitions, variable],
      },
    },
  }

  return [newEnv, variable]
}

const toRequestPatch = (
  env: Environment,
  { from, to }: Correlation
): [Environment, Patch] => {
  const [newEnv, variable] = getUniqueVariableName(env, from)

  const fromPatch: VariablePatch = {
    type: 'variable',
    target: from.index,
    variable,
  }

  switch (to.value.selector.type) {
    case 'path':
      return [
        newEnv,
        {
          type: 'path',
          from: fromPatch,
          target: to.index,
          selector: to.value.selector,
          value: toReference(variable),
        },
      ]

    case 'search':
      return [
        newEnv,
        {
          type: 'search',
          from: fromPatch,
          target: to.index,
          selector: to.value.selector,
          value: toReference(variable),
        },
      ]

    case 'json':
    case 'param':
      return [
        newEnv,
        {
          type: 'body',
          from: fromPatch,
          target: to.index,
          selector: to.value.selector,
          value: toReference(variable),
        },
      ]

    case 'header':
      return [
        newEnv,
        {
          type: 'header',
          from: fromPatch,
          target: to.index,
          selector: to.value.selector,
          value: toReference(variable),
        },
      ]

    case 'css':
      throw new CorrelationError(
        `Cannot patch request body using selector of type ${to.value.selector.type}`,
        from,
        to
      )

    default:
      return exhaustive(to.value.selector)
  }
}

const toPatches = (
  environment: Environment,
  correlations: Correlation[]
): Patch[] => {
  const [, patches] = correlations.reduce(
    ([env, patches], correlation) => {
      const [newEnv2, requestPatch] = toRequestPatch(env, correlation)

      patches.push(requestPatch)

      return [newEnv2, patches]
    },
    [environment, [] as Patch[]]
  )

  return patches
}

export const correlate = (exchanges: Exchange[]): Patch[] => {
  const correlations = findCorrelations(exchanges).filter(analyze)

  return toPatches(emptyEnvironment, correlations)
}
