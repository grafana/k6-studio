import { Box, Flex, Text } from '@radix-ui/themes'

import { CorrelationRule, Filter, Selector } from '@/types/rules'
import { FilterField } from './FilterField'
import { SelectorField } from './SelectorField'
import { CorrelationPreview } from './CorrelationPreview'

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
    <Flex gap="3" p="2">
      <Box width="50%">
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
      </Box>
      <Box width="50%">
        <CorrelationPreview rule={rule} />
      </Box>
    </Flex>
  )
}
