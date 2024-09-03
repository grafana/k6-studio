import { Box, Flex, Select, TextField } from '@radix-ui/themes'
import * as Label from '@radix-ui/react-label'

import type { Selector } from '@/types/rules'
import { exhaustive } from '@/utils/typescript'

interface SelectorFieldProps {
  selector: Selector
  onChange: (selector: Selector) => void
}

const fromOptions: Array<{
  value: Selector['from']
  label: string
}> = [
  { value: 'headers', label: 'Headers' },
  { value: 'body', label: 'Body' },
  { value: 'url', label: 'URL' },
]

const typeLabels: Record<Selector['type'], string> = {
  'begin-end': 'Begin-End',
  regex: 'Regex',
  json: 'JSON',
}

const allowedTypes: Record<Selector['from'], Selector['type'][]> = {
  headers: ['begin-end', 'regex'],
  body: ['begin-end', 'regex', 'json'],
  url: ['begin-end', 'regex'],
}

export function SelectorField({ selector, onChange }: SelectorFieldProps) {
  // value is always a string in Radix Select
  const handleFromChange = (value: Selector['from']) => {
    const type = allowedTypes[value].includes(selector.type)
      ? selector.type
      : allowedTypes[value]?.[0]

    onChange({
      ...selector,
      from: value,
      type,
    } as Selector)
  }

  const handleTypeChange = (value: Selector['type']) => {
    switch (value) {
      case 'begin-end':
        onChange({
          type: value,
          begin: '',
          end: '',
          from: selector.from,
        })
        break
      case 'regex':
        onChange({
          type: value,
          regex: '',
          from: selector.from,
        })
        break
      case 'json':
        onChange({
          type: value,
          from: 'body',
          path: '',
        })
        break
      default:
        return exhaustive(value)
    }
  }

  return (
    <>
      <Flex gap="2" wrap="wrap" mb="2">
        <Box flexGrow="1">
          <Label.Root>Target</Label.Root>
          <Select.Root value={selector.from} onValueChange={handleFromChange}>
            <Select.Trigger css={{ width: '100%' }} />
            <Select.Content>
              {fromOptions.map(({ label, value }) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Box>

        <Box flexGrow="1">
          <Label.Root>Type</Label.Root>
          <Select.Root value={selector.type} onValueChange={handleTypeChange}>
            <Select.Trigger css={{ width: '100%' }} />
            <Select.Content>
              {allowedTypes[selector.from].map((type) => (
                <Select.Item key={type} value={type}>
                  {typeLabels[type]}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Box>
      </Flex>
      <SelectorContent selector={selector} onChange={onChange} />
    </>
  )
}

function SelectorContent({
  selector,
  onChange,
}: {
  selector: Selector
  onChange: (selector: Selector) => void
}) {
  switch (selector.type) {
    case 'json':
      return (
        <>
          <Label.Root>JSON path</Label.Root>
          <TextField.Root
            value={selector.path}
            css={{ marginBottom: 'var(--space-2)' }}
            onChange={(event) =>
              onChange({
                ...selector,
                path: event.target.value,
              })
            }
          />
        </>
      )
    case 'begin-end':
      return (
        <>
          <Label.Root>Begin</Label.Root>
          <TextField.Root
            value={selector.begin}
            css={{ marginBottom: 'var(--space-2)' }}
            onChange={(event) =>
              onChange({
                ...selector,
                begin: event.target.value,
              })
            }
          />
          <Label.Root>End</Label.Root>
          <TextField.Root
            value={selector.end}
            css={{ marginBottom: 'var(--space-2)' }}
            onChange={(event) =>
              onChange({
                ...selector,
                end: event.target.value,
              })
            }
          />
        </>
      )
    case 'regex':
      return (
        <>
          <Label.Root>Regex</Label.Root>
          <TextField.Root
            value={selector.regex}
            css={{ marginBottom: 'var(--space-2)' }}
            onChange={(event) =>
              onChange({
                ...selector,
                regex: event.target.value,
              })
            }
          />
        </>
      )
    default:
      return exhaustive(selector)
  }
}
