import { Box, Grid, Heading, Switch, Text, Select } from '@radix-ui/themes'

import { TestRule } from '@/types/rules'
import { FilterField } from './FilterField'
import { SelectorField } from './SelectorField'
import { Label } from '@/components/Label'
import { useFormContext } from 'react-hook-form'

export function CorrelationEditor() {
  const { setValue, watch } = useFormContext<TestRule>()
  const replacer = watch('replacer')
  const extractionMode = watch('extractionMode')

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
        <Box mb="3">
          <Label>Extraction Mode</Label>
          <Select.Root
            defaultValue="multiple"
            value={extractionMode}
            onValueChange={(value: 'single' | 'multiple') => 
              setValue('extractionMode', value)
            }
          >
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="single">
                Single (extract once)
              </Select.Item>
              <Select.Item value="multiple">
                Multiple (extract every time)
              </Select.Item>
            </Select.Content>
          </Select.Root>
          <Text size="1" as="p" mt="1" color="gray">
            Choose whether to extract the value once or on every matching response.
          </Text>
        </Box>
        <FilterField field="extractor.filter" />
        <SelectorField field="extractor.selector" />
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
