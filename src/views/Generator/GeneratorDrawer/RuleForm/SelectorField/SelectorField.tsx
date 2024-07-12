import { Flex, SegmentedControl, Select, TextField } from '@radix-ui/themes'

import type { Selector } from '@/types/rules'
import * as Label from '@radix-ui/react-label'
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
  const handleFromChange = (value: string) => {
    const type = allowedTypes[value as Selector['from']].includes(selector.type)
      ? selector.type
      : allowedTypes[value as Selector['from']]?.[0]

    // TODO: handle types properly
    onChange({
      ...selector,
      from: value as Selector['from'],
      type,
    } as Selector)
  }

  const handleTypeChange = (value: string) => {
    onChange({
      ...selector,
      type: value as Selector['type'],
    } as Selector)
  }

  return (
    <>
      <Label.Root>Select from</Label.Root>
      <Flex gap="2">
        <Select.Root value={selector.from} onValueChange={handleFromChange}>
          <Select.Trigger />
          <Select.Content>
            {fromOptions.map(({ label, value }) => (
              <Select.Item key={value} value={value}>
                {label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <SegmentedControl.Root
          value={selector.type}
          onValueChange={handleTypeChange}
        >
          {allowedTypes[selector.from].map((type) => (
            <SegmentedControl.Item key={type} value={type}>
              {typeLabels[type]}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl.Root>
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
