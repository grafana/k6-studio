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

import { ValuePopoverBadge } from '../components'

interface ToHaveValuesFormProps {
  values: string[]
  onChange: (values: string[]) => void
}

function quote(value: string) {
  return `"${value}"`
}

function ValuesDisplay({ values }: { values: string[] }) {
  if (values.length === 0) {
    return null
  }

  if (values.length === 1) {
    return <code>{quote(values[0]!)}</code>
  }

  return <>{values.length} values</>
}

export function ToHaveValuesForm({ values, onChange }: ToHaveValuesFormProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const handleChangeInput = (index: number, value: string) => {
    const next = [...values]
    next[index] = value
    onChange(next)
  }

  const handleAdd = () => {
    onChange([...values, ''])
  }

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index))
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
              <ValuesDisplay values={values} />
            </span>
          }
        />
      </Popover.Trigger>
      <Popover.Content align="start" size="1" width="320px">
        <FieldGroup name="values" label="Expected values" labelSize="1" mb="0">
          <Flex direction="column" gap="2">
            <ScrollArea
              css={css`
                max-height: 200px;
              `}
            >
              <Flex direction="column" gap="2" pr="3">
                {values.map((value, index) => (
                  <Flex key={index} gap="2" align="center">
                    <TextField.Root
                      size="1"
                      value={value}
                      onChange={(e) => handleChangeInput(index, e.target.value)}
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
      </Popover.Content>
    </Popover.Root>
  )
}
