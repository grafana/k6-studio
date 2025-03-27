import { Box, Grid, Separator, Text } from '@radix-ui/themes'

import { ParameterizationRule } from '@/types/rules'

import { ParameterizationSelectorContent } from '../../TestRuleContainer/TestRule/TestRuleSelector'
import { FilterField } from '../FilterField'
import { SelectorField } from '../SelectorField'

import { ValueEditor } from './ValueEditor'

export function ParameterizationEditor({
  rule,
}: {
  rule: ParameterizationRule
}) {
  return (
    <>
      <Text size="2" as="p" mb="2" color="gray">
        <ParameterizationSelectorContent rule={rule} />
      </Text>
      <Grid columns="1fr auto 1fr" gap="4">
        <Box>
          <FilterField field="filter" />
          <SelectorField field="selector" />
        </Box>
        <Separator orientation="vertical" size="4" decorative />
        <Box>
          <ValueEditor />
        </Box>
      </Grid>
    </>
  )
}
