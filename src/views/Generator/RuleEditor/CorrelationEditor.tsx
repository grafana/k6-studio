import { Box, Code, Grid, Heading, Switch, Text } from '@radix-ui/themes'

import { TestRule } from '@/types/rules'
import { FilterField } from './FilterField'
import { SelectorField } from './SelectorField'
import { Label } from '@/components/Label'
import { useFormContext } from 'react-hook-form'
import { useApplyRules } from '@/store/hooks/useApplyRules'
import invariant from 'tiny-invariant'

export function CorrelationEditor() {
  const { selectedRuleInstance } = useApplyRules()

  invariant(
    selectedRuleInstance?.type === 'correlation',
    'Selected rule instance is not a correlation rule'
  )

  const { setValue, watch } = useFormContext<TestRule>()
  const { extractedValue } = selectedRuleInstance.state
  const replacer = watch('replacer')

  const isCustomReplacerSelector = !!replacer?.selector

  const toggleCustomReplacerSelector = () => {
    if (isCustomReplacerSelector) {
      setValue('replacer.selector', undefined)
    } else {
      setValue('replacer.selector', {
        from: 'body',
        type: 'begin-end',
        begin: '',
        end: '',
      })
    }
  }

  return (
    <Grid columns="1fr 1fr" gap="3">
      <Box>
        <Heading size="2" weight="medium" mb="2">
          Extractor
        </Heading>
        <Text size="2" as="p" mb="2" color="gray">
          Extraction value for correlation.
        </Text>
        <FilterField field="extractor.filter" />
        <SelectorField field="extractor.selector" />
        {extractedValue && (
          <Text size="2">
            <Text color="gray">Extracted value:</Text>{' '}
            <Code>{extractedValue}</Code>
          </Text>
        )}
        {!extractedValue && (
          <Text size="2" color="gray">
            The rule does not match any requests
          </Text>
        )}
      </Box>
      <Box>
        <Heading size="2" weight="medium" mb="2">
          Replacer
        </Heading>
        <Text size="2" as="p" mb="2" color="gray">
          Replace matched values with the extracted value.{' '}
        </Text>

        <>
          <FilterField field="replacer.filter" />
          <Label mb="2">
            <Text size="2">Customize selector</Text>

            <Switch
              onCheckedChange={toggleCustomReplacerSelector}
              checked={isCustomReplacerSelector}
              size="1"
            />
          </Label>

          {!isCustomReplacerSelector && (
            <Text size="2" as="p" mb="2" color="gray">
              By default, the correlation rule will replace all occurrences of
              the extracted value in the requests. Enable this option to fine
              tune your selection.
            </Text>
          )}
          <SelectorField field="replacer.selector" />
        </>
      </Box>
    </Grid>
  )
}
