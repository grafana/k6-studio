import { css } from '@emotion/react'
import {
  Button,
  Flex,
  IconButton,
  Popover,
  ScrollArea,
  Select,
  Text,
  TextField,
} from '@radix-ui/themes'
import { PlusIcon, XIcon } from 'lucide-react'
import { Fragment, useState } from 'react'

import { SelectOptions } from '@/components/Browser/SelectOptions'
import { FieldGroup } from '@/components/Form'
import { LocatorSelectOptionAction } from '@/schemas/browserTest/v1'

import { ValuePopoverBadge } from '../components'

type SelectOptionValue = LocatorSelectOptionAction['values'][number]

type MatchType = 'value' | 'label' | 'index'

interface SelectOptionValuesFormProps {
  values: SelectOptionValue[]
  onChange: (values: SelectOptionValue[]) => void
}

export function SelectOptionValuesForm({
  values,
  onChange,
}: SelectOptionValuesFormProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [touchedIndices, setTouchedIndices] = useState(new Set<number>())

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
    setTouchedIndices((prev) => {
      const next = new Set<number>()
      for (const i of prev) {
        if (i < index) next.add(i)
        else if (i > index) next.add(i - 1)
      }
      return next
    })
  }

  const handleBlur = (index: number) => {
    setTouchedIndices((prev) =>
      prev.has(index) ? prev : new Set(prev).add(index)
    )
  }

  const handlePopoverOpenChange = (open: boolean) => {
    setIsPopoverOpen(open)
    if (!open) {
      setTouchedIndices(new Set(values.map((_, i) => i)))
    }
  }

  const errors = validateSelectOptions(values)

  let badgeError: string | undefined
  for (const [i, msg] of errors) {
    if (touchedIndices.has(i)) {
      badgeError = msg
      break
    }
  }

  return (
    <Popover.Root open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
      <Popover.Trigger>
        <ValuePopoverBadge
          displayValue={
            <span
              css={css`
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
              `}
            >
              <SelectOptions options={values} />
            </span>
          }
          error={badgeError}
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
                {values.map((entry, index) => {
                  const error = touchedIndices.has(index)
                    ? errors.get(index)
                    : undefined

                  return (
                    <Fragment key={index}>
                      <Flex direction="column" gap="1">
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
                            color={error ? 'red' : undefined}
                            type={
                              getMatchType(entry) === 'index'
                                ? 'number'
                                : 'text'
                            }
                            {...(getMatchType(entry) === 'index'
                              ? { min: 0 }
                              : {})}
                            value={getMatchInput(entry)}
                            onChange={(e) =>
                              handleChangeInput(index, e.target.value)
                            }
                            onBlur={() => handleBlur(index)}
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
                        {error && (
                          <Text size="1" color="red">
                            {error}
                          </Text>
                        )}
                      </Flex>
                    </Fragment>
                  )
                })}
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

function validateSelectOptionEntry(
  entry: SelectOptionValue
): string | undefined {
  if (entry.label !== undefined && entry.label.trim() === '') {
    return 'Label cannot be empty'
  }
  if (entry.index !== undefined && !Number.isInteger(entry.index)) {
    return 'Index must be an integer'
  }
  return undefined
}

function validateSelectOptions(values: SelectOptionValue[]) {
  const errors = new Map<number, string>()
  for (let i = 0; i < values.length; i++) {
    const msg = validateSelectOptionEntry(values[i]!)
    if (msg) errors.set(i, msg)
  }
  return errors
}
