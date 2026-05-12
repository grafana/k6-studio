import { css } from '@emotion/react'
import {
  Button,
  Flex,
  IconButton,
  Popover,
  ScrollArea,
  TextField,
} from '@radix-ui/themes'
import { PlusIcon, XIcon } from 'lucide-react'
import { useState } from 'react'

import { FieldGroup } from '@/components/Form'
import { LocatorToHaveValueAction } from '@/schemas/browserTest'

import { ValuePopoverBadge } from '../components'

type ExpectedValue = LocatorToHaveValueAction['expected']

interface ToHaveValuesFormProps {
  expected: ExpectedValue
  onChange: (expected: ExpectedValue) => void
}

function quote(value: string) {
  return `"${value}"`
}

function ExpectedDisplay({ expected }: { expected: ExpectedValue }) {
  if (expected.current === 'single') {
    return <code>{quote(expected.values.single ?? '')}</code>
  }

  const values = expected.values.multiple ?? []

  if (values.length === 0) {
    return null
  }

  if (values.length === 1) {
    return <code>{quote(values[0]!)}</code>
  }

  return <>{values.length} values</>
}

export function ToHaveValuesForm({
  expected,
  onChange,
}: ToHaveValuesFormProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const singleValue = expected.values.single ?? ''
  const multipleValues = expected.values.multiple ?? []

  /**
   * I implemented all of this before realizing that k6-testing doesn't have the `toHaveValues`
   * assertion. It seems a shame to throw it all away, so I'm leaving in it.
   */
  // const handleToggleMultiple = (multiple: boolean) => {
  //   onChange({
  //     ...expected,
  //     current: multiple ? 'multiple' : 'single',
  //   })
  // }

  const handleChangeSingle = (value: string) => {
    onChange({
      ...expected,
      values: {
        ...expected.values,
        single: value,
      },
    })
  }

  const handleChangeMultiple = (values: string[]) => {
    onChange({
      ...expected,
      values: {
        ...expected.values,
        multiple: values,
      },
    })
  }

  const handleChangeMultipleAt = (index: number, value: string) => {
    const next = [...multipleValues]
    next[index] = value
    handleChangeMultiple(next)
  }

  const handleAdd = () => {
    handleChangeMultiple([...multipleValues, ''])
  }

  const handleRemove = (index: number) => {
    handleChangeMultiple(multipleValues.filter((_, i) => i !== index))
  }

  return (
    <Popover.Root open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
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
              <ExpectedDisplay expected={expected} />
            </span>
          }
        />
      </Popover.Trigger>
      <Popover.Content align="start" size="1" width="320px">
        <Flex direction="column" gap="3">
          {/* <Text size="1" as="label">
            <Flex gap="2" align="center">
              <Switch
                size="1"
                checked={expected.current === 'multiple'}
                onCheckedChange={handleToggleMultiple}
              />
              Multiple values
            </Flex>
          </Text> */}
          {expected.current === 'single' ? (
            <FieldGroup
              name="value"
              label="Expected value"
              labelSize="1"
              mb="0"
            >
              <TextField.Root
                size="1"
                value={singleValue}
                onChange={(e) => handleChangeSingle(e.target.value)}
                placeholder="Enter text..."
              />
            </FieldGroup>
          ) : (
            <FieldGroup
              name="values"
              label="Expected values"
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
                    {multipleValues.map((value, index) => (
                      <Flex key={index} gap="2" align="center">
                        <TextField.Root
                          size="1"
                          value={value}
                          onChange={(e) =>
                            handleChangeMultipleAt(index, e.target.value)
                          }
                          placeholder="Enter text..."
                          css={css`
                            flex: 1;
                          `}
                        />
                        <IconButton
                          aria-label="Remove value"
                          size="1"
                          variant="ghost"
                          color="gray"
                          onClick={() => handleRemove(index)}
                        >
                          <XIcon />
                        </IconButton>
                      </Flex>
                    ))}
                  </Flex>
                </ScrollArea>
                <Button
                  size="1"
                  variant="ghost"
                  color="gray"
                  onClick={handleAdd}
                  css={css`
                    margin: 0;
                    align-self: stretch;
                  `}
                >
                  <PlusIcon /> Add value
                </Button>
              </Flex>
            </FieldGroup>
          )}
        </Flex>
      </Popover.Content>
    </Popover.Root>
  )
}
