import { Code, Flex, Text } from '@radix-ui/themes'

type OptionValue = string | number | boolean | null | undefined

type OptionsSummaryProps = {
  options: unknown
  label?: string
}

export function OptionsSummary({
  options,
  label = 'Options:',
}: OptionsSummaryProps) {
  const entries = Object.entries(normalizeOptions(options)).filter(
    ([, value]) => {
      if (value === undefined || value === null) {
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
            {key}={renderValue(key, value)}
          </Code>
        </span>
      ))}
    </Flex>
  )
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
