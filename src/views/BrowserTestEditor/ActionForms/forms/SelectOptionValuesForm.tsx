import { css } from '@emotion/react'
import {
  Button,
  Flex,
  IconButton,
  Popover,
  ScrollArea,
  Select,
  TextField,
} from '@radix-ui/themes'
import { PlusIcon, XIcon } from 'lucide-react'
import { Fragment, useState } from 'react'

import { SelectOptions } from '@/components/Browser/SelectOptions'
import { FieldGroup } from '@/components/Form'
import { LocatorSelectOptionAction } from '@/main/runner/schema'

import { ValuePopoverBadge } from '../components'

type SelectOptionValue = LocatorSelectOptionAction['values'][number]

type MatchType = 'value' | 'label' | 'index'

function getMatchType(entry: SelectOptionValue): MatchType {
  if (entry.label !== undefined) return 'label'
  if (entry.index !== undefined) return 'index'
  return 'value'
}

function getMatchInput(entry: SelectOptionValue): string {
  if (entry.label !== undefined) return entry.label
  if (entry.index !== undefined) return String(entry.index)
  return entry.value ?? ''
}

function toEntry(type: MatchType, input: string): SelectOptionValue {
  switch (type) {
    case 'value':
      return { value: input }
    case 'label':
      return { label: input }
    case 'index':
      return { index: input === '' ? 0 : Number(input) }
  }
}

interface SelectOptionValuesFormProps {
  values: SelectOptionValue[]
  onChange: (values: SelectOptionValue[]) => void
}

export function SelectOptionValuesForm({
  values,
  onChange,
}: SelectOptionValuesFormProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const handleChangeType = (index: number, type: MatchType) => {
    const current = values[index]
    if (!current) return
    const input = getMatchInput(current)
    const next = [...values]
    next[index] = toEntry(type, input)
    onChange(next)
  }

  const handleChangeInput = (index: number, input: string) => {
    const current = values[index]
    if (!current) return
    const type = getMatchType(current)
    const next = [...values]
    next[index] = toEntry(type, input)
    onChange(next)
  }

  const handleAdd = () => {
    onChange([...values, { value: '' }])
  }

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index))
  }

  return (
    <Popover.Root open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <Popover.Trigger>
        <ValuePopoverBadge
          displayValue={
            values.length === 0 ? '(none)' : <SelectOptions options={values} />
          }
          error={values.length === 0 ? 'At least one option is required' : null}
        />
      </Popover.Trigger>
      <Popover.Content align="start" size="1" width="360px">
        <FieldGroup
          name="options"
          label="Options to select"
          labelSize="1"
          mb="0"
        >
          <Flex direction="column" gap="2">
            <ScrollArea
              css={css`
                max-height: 200px;
              `}
            >
              <Flex direction="column" gap="2" pr="3">
                {values.map((entry, index) => (
                  <Fragment key={index}>
                    <Flex gap="2" align="center">
                      <Select.Root
                        size="1"
                        value={getMatchType(entry)}
                        onValueChange={(type: MatchType) =>
                          handleChangeType(index, type)
                        }
                      >
                        <Select.Trigger
                          css={css`
                            min-width: 80px;
                          `}
                        />
                        <Select.Content>
                          <Select.Item value="value">Value</Select.Item>
                          <Select.Item value="label">Label</Select.Item>
                          <Select.Item value="index">Index</Select.Item>
                        </Select.Content>
                      </Select.Root>
                      <TextField.Root
                        size="1"
                        type={
                          getMatchType(entry) === 'index' ? 'number' : 'text'
                        }
                        {...(getMatchType(entry) === 'index' ? { min: 0 } : {})}
                        value={getMatchInput(entry)}
                        onChange={(e) =>
                          handleChangeInput(index, e.target.value)
                        }
                        placeholder={
                          getMatchType(entry) === 'index'
                            ? '0'
                            : 'Enter text...'
                        }
                        css={css`
                          flex: 1;
                        `}
                      />
                      <IconButton
                        aria-label="Remove option"
                        size="1"
                        variant="ghost"
                        color="gray"
                        onClick={() => handleRemove(index)}
                      >
                        <XIcon />
                      </IconButton>
                    </Flex>
                  </Fragment>
                ))}
              </Flex>
            </ScrollArea>
            <Button
              size="1"
              variant="ghost"
              color="gray"
              onClick={handleAdd}
              css={css`
                align-self: flex-start;
              `}
            >
              <PlusIcon /> Add option
            </Button>
          </Flex>
        </FieldGroup>
      </Popover.Content>
    </Popover.Root>
  )
}
