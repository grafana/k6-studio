import {
  Box,
  Code,
  Flex,
  Grid,
  Heading,
  Separator,
  Switch,
  Text,
} from '@radix-ui/themes'
import { InfoIcon } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

import { FieldGroup } from '@/components/Form'
import { ControlledRadioGroup } from '@/components/Form/ControllerRadioGroup'
import { Label } from '@/components/Label'
import { PopoverTooltip } from '@/components/PopoverTooltip'
import { useApplyRules } from '@/store/generator/hooks/useApplyRules'
import { RuleInstance, TestRule } from '@/types/rules'

import { FilterField } from './FilterField'
import { SelectorField } from './SelectorField'

const EXTRACTION_MODE_OPTIONS = [
  { value: 'single', label: 'First match' },
  { value: 'multiple', label: 'Most recent match' },
]

export function CorrelationEditor() {
  const { selectedRuleInstance } = useApplyRules()

  const {
    setValue,
    watch,
    control,
    formState: { errors },
  } = useFormContext<TestRule>()

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
    <Grid columns="1fr auto 1fr" gap="4">
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
        <ExtractedValue selectedRuleInstance={selectedRuleInstance} />
      </Box>
      <Separator orientation="vertical" size="4" decorative />
      <Box>
        <Flex justify="between" align="center">
          <Heading size="2" weight="medium" mb="2">
            Replacer
          </Heading>

          <Flex align="center" gap="1" mb="2">
            <PopoverTooltip content={replacerTooltip}>
              <InfoIcon />
            </PopoverTooltip>
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

function ExtractedValue({
  selectedRuleInstance,
}: {
  selectedRuleInstance?: RuleInstance
}) {
  if (selectedRuleInstance?.type !== 'correlation') {
    return null
  }

  const extractedValue = selectedRuleInstance?.state?.extractedValue

  if (extractedValue === undefined) {
    return (
      <Text size="2" color="gray">
        The rule does not match any requests
      </Text>
    )
  }
  return (
    <Text size="2">
      <Text color="gray">Extracted value:</Text>{' '}
      <pre>
        <Code>{JSON.stringify(extractedValue, null, 2)}</Code>
      </pre>
    </Text>
  )
}

const replacerTooltip =
  'By default, the correlation rule will replace all occurrences of the extracted value in the requests. Enable this option to fine tune your selection.'
