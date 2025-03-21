import { ProxyData, RequestSnippetSchema } from '@/types'
import { TestRule } from '@/types/rules'

import { exhaustive } from '../utils/typescript'

import { createCorrelationRuleInstance } from './correlation'
import { createCustomCodeRuleInstance } from './customCode'
import { createParameterizationRuleInstance } from './parameterization'
import { generateSequentialInt } from './utils'
import { createVerificationRuleInstance } from './verification'

function createSequentialIdPool() {
  const currentId: Record<
    TestRule['type'],
    Generator<number, number, number>
  > = {
    correlation: generateSequentialInt(),
    parameterization: generateSequentialInt(),
    verification: generateSequentialInt(),
    customCode: generateSequentialInt(),
  }

  return (type: TestRule['type']) => currentId[type]
}

export function applyRules(recording: ProxyData[], rules: TestRule[]) {
  const idGenerator = createSequentialIdPool()
  const ruleInstances = rules
    .filter((rule) => rule.enabled)
    .map((rule) => createRuleInstance(rule, idGenerator(rule.type)))

  const requestSnippetSchemas = recording.map((data) =>
    ruleInstances.reduce<RequestSnippetSchema>((acc, rule) => rule.apply(acc), {
      data,
      before: [],
      after: [],
      checks: [],
    })
  )

  return { requestSnippetSchemas, ruleInstances }
}

function createRuleInstance<T extends TestRule>(
  rule: T,
  idGenerator: Generator<number, number, number>
) {
  switch (rule.type) {
    case 'correlation':
      return createCorrelationRuleInstance(rule, idGenerator)
    case 'parameterization':
      return createParameterizationRuleInstance(rule, idGenerator)
    case 'verification':
      return createVerificationRuleInstance(rule)
    case 'customCode':
      return createCustomCodeRuleInstance(rule)

    default:
      return exhaustive(rule)
  }
}
