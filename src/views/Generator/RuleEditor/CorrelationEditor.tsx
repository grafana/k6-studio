import {
  Box,
  Code,
  Flex,
  Grid,
  Heading,
  Switch,
  Text,
  Tooltip,
} from '@radix-ui/themes'

import { TestRule } from '@/types/rules'
import { FilterField } from './FilterField'
import { SelectorField } from './SelectorField'
import { Label } from '@/components/Label'
import { useFormContext } from 'react-hook-form'
import { FieldGroup } from '@/components/Form'
import { ControlledRadioGroup } from '@/components/Form/ControllerRadioGroup'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { useApplyRules } from '@/store/hooks/useApplyRules'
import invariant from 'tiny-invariant'

const EXTRACTION_MODE_OPTIONS = [
  { value: 'single', label: 'First match' },
  { value: 'multiple', label: 'Most recent match' },
]

export function CorrelationEditor() {
  const { selectedRuleInstance } = useApplyRules()

  invariant(
    selectedRuleInstance?.type === 'correlation',
    'Selected rule instance is not a correlation rule'
  )

  const {
    setValue,
    watch,
    control,
    formState: { errors },
  } = useFormContext<TestRule>()

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
        <FieldGroup
          name="extractor.extractionMode,"
          label="Use value from"
          errors={errors}
        >
          <ControlledRadioGroup
            name="extractor.extractionMode"
            control={control}
            options={EXTRACTION_MODE_OPTIONS}
            direction="row"
            onChange={(value) =>
              setValue(
                'extractor.extractionMode',
                value as 'single' | 'multiple'
              )
            }
          />
        </FieldGroup>
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
        <Flex justify="between" align="center">
          <Heading size="2" weight="medium" mb="2">
            Replacer
          </Heading>

          <Flex align="center" gap="1" mb="2">
            <Tooltip content={replacerTooltip}>
              <InfoCircledIcon />
            </Tooltip>
            <Label>
              <Text size="2" css={{ lineHeight: '18px' }}>
                Customize selector
              </Text>
              <Switch
                onCheckedChange={toggleCustomReplacerSelector}
                checked={isCustomReplacerSelector}
                size="1"
              />
            </Label>
          </Flex>
        </Flex>
        <Text size="2" as="p" mb="2" color="gray">
          Replace matched values with the extracted value.{' '}
        </Text>

        <>
          <FilterField field="replacer.filter" />

          {!isCustomReplacerSelector && (
            <Text size="2" as="p" mb="2" color="gray">
              The correlation rule will replace all occurrences of the extracted
              value in the requests.
            </Text>
          )}
          <SelectorField field="replacer.selector" />
        </>
      </Box>
    </Grid>
  )
}

const replacerTooltip =
  'By default, the correlation rule will replace all occurrences of the extracted value in the requests. Enable this option to fine tune your selection.'
