import { Box, Grid, Heading, Switch, Text } from '@radix-ui/themes'

import { TestRule } from '@/types/rules'
import { FilterField } from './FilterField'
import { SelectorField } from './SelectorField'
import { Label } from '@/components/Label'
import { useFormContext } from 'react-hook-form'
import { FieldGroup } from '@/components/Form'
import { ControlledRadioGroup } from '@/components/Form/ControllerRadioGroup'

const EXTRACTION_MODE_OPTIONS = [
  { value: 'single', label: 'First match' },
  { value: 'multiple', label: 'Most recent match' },
]

export function CorrelationEditor() {
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
