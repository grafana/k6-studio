import { Code, Flex, Text } from '@radix-ui/themes'

type OptionValue = string | number | boolean | null | undefined

type OptionsSummaryProps = {
  options: unknown
  label?: string
}

const KEY_LABELS: Record<string, string> = {
  waitForNavigation: 'wait for navigation',
}

export function OptionsSummary({
  options,
  label = 'Options:',
}: OptionsSummaryProps) {
  const entries = Object.entries(normalizeOptions(options)).filter(
    ([key, value]) => {
      if (value === undefined || value === null) {
        return false
      }

      if (value === false && key in KEY_LABELS) {
        return false
      }

      return value !== ''
    }
  )

  if (entries.length === 0) {
    return null
  }

  return (
    <Flex pl="5" gap="1" align="center">
      <Text size="1" color="gray">
        {label}
      </Text>
      {entries.map(([key, value]) => (
        <span key={key}>
          <Code color="gray" size="1">
            {renderEntry(key, value)}
          </Code>
        </span>
      ))}
    </Flex>
  )
}

function renderEntry(key: string, value: OptionValue) {
  const label = KEY_LABELS[key] ?? key

  if (typeof value === 'boolean' && key in KEY_LABELS) {
    return label
  }

  return `${label}=${renderValue(key, value)}`
}

function renderValue(key: string, value: OptionValue) {
  if (key === 'timeout') {
    return value != null ? `${value}ms` : ''
  }

  return String(value)
}

function normalizeOptions(options: unknown): Record<string, OptionValue> {
  if (!options || typeof options !== 'object') {
    return {}
  }

  const entries = Object.entries(options).filter(([, value]) =>
    isOptionValue(value)
  )

  return Object.fromEntries(entries)
}

function isOptionValue(value: unknown): value is OptionValue {
  return (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
}
