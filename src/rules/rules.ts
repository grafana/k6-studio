import { TestRule } from '@/types/rules'
import { exhaustive } from '../utils/typescript'
import { createCustomCodeRuleInstance } from './customCode'
import { createCorrelationRuleInstance } from './correlation'
import { createVerificationRuleInstance } from './verification'
import { createParameterizationRuleInstance } from './parameterization'
import { ProxyData, RequestSnippetSchema } from '@/types'
import { generateSequentialInt } from './utils'

export function applyRules(recording: ProxyData[], rules: TestRule[]) {
  const idGenerator = generateSequentialInt()
  const ruleInstances = rules.map((rule) =>
    createRuleInstance(rule, idGenerator)
  )

  const requestSnippetSchemas = recording.map((data) =>
    ruleInstances.reduce<RequestSnippetSchema>((acc, rule) => rule.apply(acc), {
      data,
      before: [],
      after: [],
    })
  )

  return { requestSnippetSchemas, ruleInstances }
}

function createRuleInstance<T extends TestRule>(
  rule: T,
  idGenerator: Generator<number>
) {
  switch (rule.type) {
    case 'correlation':
      return createCorrelationRuleInstance(rule, idGenerator)
    case 'parameterization':
      return createParameterizationRuleInstance(rule)
    case 'verification':
      return createVerificationRuleInstance(rule)
    case 'customCode':
      return createCustomCodeRuleInstance(rule)

    default:
      return exhaustive(rule)
  }
}
