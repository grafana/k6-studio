import { Box, Grid, Heading, Switch, Text } from '@radix-ui/themes'

import { TestRule } from '@/types/rules'
import { FilterField } from './FilterField'
import { SelectorField } from './SelectorField'
import { Label } from '@/components/Label'
import { useFormContext } from 'react-hook-form'

export function CorrelationEditor() {
  const { setValue, watch } = useFormContext<TestRule>()
  const replacer = watch('replacer')

  const toggleCustomReplacer = () => {
    if (replacer) {
      setValue('replacer', undefined)
    } else {
      setValue('replacer', {
        filter: { path: '' },
        selector: { from: 'body', type: 'begin-end', begin: '', end: '' },
      })
    }
  }

  return (
    <Grid columns="1fr 1fr" gap="3">
      <Box>
        <Heading size="2" weight="medium" mb="2">
          Extractor
        </Heading>
        <FilterField path="extractor.filter" />
        <SelectorField type="extractor" />
      </Box>
      <Box>
        <Label mb="2">
          <Heading size="2" weight="medium">
            Replacer
          </Heading>
          <Switch onCheckedChange={toggleCustomReplacer} checked={!!replacer} />
        </Label>
        {!replacer && (
          <Text size="2">
            By default, the correlation rule will replace all occurrences of the
            extracted value in the requests. Enable this option to fine tune
            your selection.
          </Text>
        )}
        {replacer && (
          <>
            <FilterField path="replacer.filter" />
            <SelectorField type="replacer" />
          </>
        )}
      </Box>
    </Grid>
  )
}