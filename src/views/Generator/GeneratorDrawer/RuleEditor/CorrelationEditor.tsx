import { Box, Flex, Heading, Switch, Text } from '@radix-ui/themes'

import { CorrelationRule, Filter, Selector } from '@/types/rules'
import { FilterField } from './FilterField'
import { SelectorField } from './SelectorField'
import { Label } from '@/components/Label'

interface CorrelationEditorProps {
  rule: CorrelationRule
  onChangeRule: (rule: CorrelationRule) => void
}

export function CorrelationEditor({
  rule,
  onChangeRule,
}: CorrelationEditorProps) {
  const { replacer } = rule
  const handleFilterChange = (
    filter: Filter,
    type: 'extractor' | 'replacer'
  ) => {
    onChangeRule({ ...rule, [type]: { ...rule[type], filter } })
  }

  const handleSelectorChange = (
    selector: Selector,
    type: 'extractor' | 'replacer'
  ) => {
    onChangeRule({ ...rule, [type]: { ...rule[type], selector } })
  }

  const toggleCustomReplacer = () => {
    if (replacer) {
      onChangeRule({ ...rule, replacer: undefined })
    } else {
      onChangeRule({
        ...rule,
        replacer: {
          filter: { path: '' },
          selector: { from: 'body', type: 'begin-end', begin: '', end: '' },
        },
      })
    }
  }

  return (
    <Flex wrap="wrap">
      <Box p="2" width="50%">
        <Heading mb="2">Extractor</Heading>
        <FilterField
          filter={rule.extractor.filter}
          onChange={(filter) => handleFilterChange(filter, 'extractor')}
        />
        <SelectorField
          selector={rule.extractor.selector}
          onChange={(selector) => handleSelectorChange(selector, 'extractor')}
        />
      </Box>

      <Box width="50%" p="2" pr="3">
        <Label mb="2">
          <Heading>Replacer</Heading>
          <Switch onCheckedChange={toggleCustomReplacer} checked={!!replacer} />
        </Label>
        {!replacer && (
          <Text size="2">
            By default correlation rule will replace all found occurrences of
            the extracted value in the requests, you can enable this option to
            fine tune your selection
          </Text>
        )}
        {replacer && (
          <>
            <FilterField
              filter={replacer.filter}
              onChange={(filter) => handleFilterChange(filter, 'replacer')}
            />
            <SelectorField
              selector={replacer.selector}
              onChange={(selector) =>
                handleSelectorChange(selector, 'replacer')
              }
            />
          </>
        )}
      </Box>
    </Flex>
  )
}
