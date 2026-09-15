import { Badge, Checkbox, Code, Flex, Text } from '@radix-ui/themes'

import { HostCategory, HostSuggestion } from '../../state/types'

const CATEGORY_LABELS: Record<HostCategory, string> = {
  application: 'Application',
  api: 'API',
  auth: 'Authentication',
  cdn: 'Static assets',
  analytics: 'Analytics',
  other: 'Other',
}

function SuggestionBadge({ suggested }: { suggested: boolean }) {
  if (!suggested) {
    return null
  }

  return <Badge color="orange">Suggested</Badge>
}

interface HostRowProps {
  suggestion: HostSuggestion
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function HostRow({
  suggestion,
  checked,
  onCheckedChange,
}: HostRowProps) {
  const { host, category, suggested, reason, requestCount } = suggestion

  return (
    <Flex
      gap="3"
      align="start"
      p="3"
      css={{ borderBottom: '1px solid var(--gray-4)' }}
    >
      <Checkbox
        mt="1"
        checked={checked}
        aria-label={`Include ${host}`}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      <Flex direction="column" gap="1" css={{ minWidth: 0 }} flexGrow="1">
        <Flex gap="2" align="center" wrap="wrap">
          <Code size="2" variant="ghost">
            {host}
          </Code>
          <Badge color="gray" variant="soft">
            {CATEGORY_LABELS[category]}
          </Badge>
          <SuggestionBadge suggested={suggested} />
          <Text size="1" color="gray">
            {requestCount} request{requestCount === 1 ? '' : 's'}
          </Text>
        </Flex>
        <Text size="1" color="gray">
          {reason}
        </Text>
      </Flex>
    </Flex>
  )
}
