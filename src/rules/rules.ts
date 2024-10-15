import { RuleInstance, TestRule } from '@/types/rules'
import { exhaustive } from '../utils/typescript'
import { createCustomCodeRuleInstance } from './customCode'
import { createCorrelationRuleInstance } from './correlation'
import { createVerificationRuleInstance } from './verification'
import { createParameterizationRuleInstance } from './parameterization'
import { ProxyData, RequestSnippetSchema } from '@/types'

export function applyRules(
  recording: ProxyData[],
  rules: TestRule[]
): {
  requestSnippetSchemas: RequestSnippetSchema[]
  ruleInstances: RuleInstance[]
} {
  const ruleInstances = rules.map(createRuleInstance)

  const requestSnippetSchemas = recording.map((data) =>
    ruleInstances.reduce<RequestSnippetSchema>((acc, rule) => rule.apply(acc), {
      data,
      before: [],
      after: [],
    })
  )

  return { requestSnippetSchemas, ruleInstances }
}

export function createRuleInstance<T extends TestRule>(rule: T) {
  switch (rule.type) {
    case 'correlation':
      return createCorrelationRuleInstance(rule)
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

// TODO: need to make this return exact instance of passed rule
export function previewRuleChanges<T extends TestRule>({
  rules,
  rule,
  recording,
}: {
  rules: T[]
  rule: T
  recording: ProxyData[]
}) {
  const preceedingRules = rules.slice(0, rules.indexOf(rule))
  const { requestSnippetSchemas } = applyRules(recording, preceedingRules)

  const ruleInstance = createRuleInstance(rule)
  requestSnippetSchemas.forEach(ruleInstance.apply)

  return ruleInstance
}
