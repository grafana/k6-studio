import { Container, Text } from '@radix-ui/themes'

import { useGeneratorStore, useSelectedRule } from '@/hooks/useGeneratorStore'
import { CorrelationRule, Selector, type Filter } from '@/types/rules'
import { exhaustive } from '@/utils/typescript'
import { SelectorField } from './SelectorField'
import { FilterField } from './FilterField'

export function RuleForm() {
  const rule = useSelectedRule()
  const { updateRule } = useGeneratorStore()

  if (!rule) {
    return null
  }

  switch (rule.type) {
    case 'correlation':
      return <CorrelationForm rule={rule} onChangeRule={updateRule} />
    case 'customCode':
    case 'parameterization':
    case 'verification':
      return null
    default:
      return exhaustive(rule)
  }
}

interface CorrelationFormProps {
  rule: CorrelationRule
  onChangeRule: (rule: CorrelationRule) => void
}

// Only supports extractor at the moment
function CorrelationForm({ rule, onChangeRule }: CorrelationFormProps) {
  const handleFilterChange = (filter: Filter) => {
    onChangeRule({ ...rule, extractor: { ...rule.extractor, filter } })
  }

  const handleSelectorChange = (selector: Selector) => {
    onChangeRule({ ...rule, extractor: { ...rule.extractor, selector } })
  }

  return (
    <Container align="left" size="1" p="2">
      <Text>Extractor</Text>
      <div>
        <FilterField
          filter={rule.extractor.filter}
          onChange={handleFilterChange}
        />
      </div>
      <div>
        <SelectorField
          selector={rule.extractor.selector}
          onChange={handleSelectorChange}
        />
      </div>
    </Container>
  )
}
