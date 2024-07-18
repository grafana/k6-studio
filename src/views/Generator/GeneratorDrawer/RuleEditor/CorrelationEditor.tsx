import { Container, Text } from '@radix-ui/themes'

import { CorrelationRule, Filter, Selector } from '@/schemas/rules'
import { FilterField } from './FilterField'
import { SelectorField } from './SelectorField'

interface CorrelationEditorProps {
  rule: CorrelationRule
  onChangeRule: (rule: CorrelationRule) => void
}

// Only supports extractor at the moment
export function CorrelationEditor({
  rule,
  onChangeRule,
}: CorrelationEditorProps) {
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
