import { Box, Flex, TextField } from '@radix-ui/themes'

import type { Selector, TestRule } from '@/types/rules'
import { exhaustive } from '@/utils/typescript'
import { useFormContext } from 'react-hook-form'
import { ControlledSelect, FieldGroup } from '@/components/Form'
import { HeaderSelect } from './HeaderSelect'

const fromOptions: Array<{
  value: Selector['from']
  label: string
}> = [
  { value: 'headers', label: 'Headers' },
  { value: 'body', label: 'Body' },
  { value: 'url', label: 'URL' },
]

const typeOptions = {
  beginEnd: { value: 'begin-end', label: 'Begin-End' },
  regex: { value: 'regex', label: 'Regex' },
  json: { value: 'json', label: 'JSON' },
  headerName: { value: 'header-name', label: 'Name' },
} as const

const allowedTypes: Record<
  Selector['from'],
  Array<{ value: Selector['type']; label: string }>
> = {
  headers: [typeOptions.beginEnd, typeOptions.regex, typeOptions.headerName],
  body: [typeOptions.beginEnd, typeOptions.regex, typeOptions.json],
  url: [typeOptions.beginEnd, typeOptions.regex],
}

export function SelectorField({
  field,
}: {
  field: 'extractor.selector' | 'replacer.selector' | 'selector'
}) {
  const {
    watch,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<TestRule>()
  const selector = watch(field)

  if (!selector) {
    return null
  }

  const handleFromChange = (value: Selector['from']) => {
    // When "from" changes reset type to the first allowed type if the current type is not allowed
    if (!allowedTypes[value].find(({ value }) => value === selector.type)) {
      handleTypeChange('begin-end')
    }

    setValue(`${field}.from`, value)
  }

  const handleTypeChange = (value: Selector['type']) => {
    switch (value) {
      case 'begin-end':
        setValue(field, {
          type: value,
          begin: '',
          end: '',
          from: selector.from,
        })
        break
      case 'regex':
        setValue(field, {
          type: value,
          regex: '',
          from: selector.from,
        })
        break
      case 'json':
        setValue(field, {
          type: value,
          from: 'body',
          path: '',
        })
        break
      case 'header-name':
        setValue(field, {
          type: value,
          name: '',
          from: 'headers',
        })
        break

      default:
        return exhaustive(value)
    }
  }

  return (
    <>
      <Flex gap="2" wrap="wrap">
        <Box flexGrow="1">
          <FieldGroup label="Target" name={`${field}.from`} errors={errors}>
            <ControlledSelect
              control={control}
              name={`${field}.from`}
              options={fromOptions}
              onChange={handleFromChange}
            />
          </FieldGroup>
        </Box>

        <Box flexGrow="1">
          <FieldGroup label="Type" name={`${field}.type`} errors={errors}>
            <ControlledSelect
              control={control}
              name={`${field}.type`}
              options={allowedTypes[selector.from]}
              onChange={handleTypeChange}
            />
          </FieldGroup>
        </Box>
      </Flex>
      <SelectorContent selector={selector} field={field} />
    </>
  )
}

function SelectorContent({
  selector,
  field,
}: {
  selector: Selector
  field: 'extractor.selector' | 'replacer.selector' | 'selector'
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TestRule>()

  switch (selector.type) {
    case 'json':
      return (
        <FieldGroup name={`${field}.path`} errors={errors} label="JSON path">
          <TextField.Root {...register(`${field}.path`)} />
        </FieldGroup>
      )
    case 'begin-end':
      return (
        <>
          <FieldGroup
            name={`${field}.begin`}
            errors={errors}
            label="Begin"
            hint="The string immediately before the value to be extracted."
          >
            <TextField.Root {...register(`${field}.begin`)} />
          </FieldGroup>
          <FieldGroup
            name={`${field}.end`}
            errors={errors}
            label="End"
            hint="The string immediately after the value to be extracted"
          >
            <TextField.Root {...register(`${field}.end`)} />
          </FieldGroup>
        </>
      )
    case 'regex':
      return (
        <FieldGroup name={`${field}.regex`} errors={errors} label="Regex">
          <TextField.Root {...register(`${field}.regex`)} />
        </FieldGroup>
      )
    case 'header-name':
      return <HeaderSelect field={field} />
    default:
      return exhaustive(selector)
  }
}
