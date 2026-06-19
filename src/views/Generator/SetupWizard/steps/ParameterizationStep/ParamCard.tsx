import {
  Badge,
  Card,
  Code,
  Flex,
  Switch,
  Text,
  TextField,
} from '@radix-ui/themes'

import { useGeneratorStore } from '@/store/generator'
import { ParameterizationRule } from '@/types/rules'

import { ParamSuggestionMeta } from '../../state/types'

function VariableValueField({ variableName }: { variableName: string }) {
  const variables = useGeneratorStore((store) => store.variables)
  const setVariables = useGeneratorStore((store) => store.setVariables)

  const variable = variables.find(
    (candidate) => candidate.name === variableName
  )

  const handleChange = (value: string) => {
    setVariables(
      variables.map((candidate) =>
        candidate.name === variableName ? { ...candidate, value } : candidate
      )
    )
  }

  return (
    <TextField.Root
      size="2"
      value={variable?.value ?? ''}
      aria-label={`Value of ${variableName}`}
      onChange={(event) => handleChange(event.target.value)}
    />
  )
}

function LocationBadge({
  location,
}: {
  location: ParamSuggestionMeta['location']
}) {
  return (
    <Badge
      color="gray"
      variant="soft"
      title={`${location.method} ${location.path}`}
      css={{ minWidth: 0 }}
    >
      <Code
        size="1"
        variant="ghost"
        css={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: 420,
        }}
      >
        {location.method} {location.path}
      </Code>
      <Text css={{ whiteSpace: 'nowrap' }}>· in:{location.in}</Text>
    </Badge>
  )
}

interface ParamCardProps {
  meta: ParamSuggestionMeta
  rule: ParameterizationRule
}

export function ParamCard({ meta, rule }: ParamCardProps) {
  const toggleEnableRule = useGeneratorStore((state) => state.toggleEnableRule)

  const variableName =
    rule.value.type === 'variable' ? rule.value.variableName : meta.field

  return (
    <Card size="2">
      <Flex direction="column" gap="3">
        <Flex gap="2" align="center">
          <Text size="2" weight="bold" css={{ whiteSpace: 'nowrap' }}>
            {meta.field}
          </Text>
          <LocationBadge location={meta.location} />
          <Flex flexGrow="1" />
          <Switch
            size="1"
            checked={rule.enabled}
            aria-label={`Enable ${meta.field} rule`}
            onCheckedChange={() => toggleEnableRule(rule.id)}
          />
        </Flex>
        <Flex direction="column" gap="1" css={{ maxWidth: 460 }}>
          <Text size="1" color="gray">
            Replaced with variable <Code size="1">{variableName}</Code>
          </Text>
          <VariableValueField variableName={variableName} />
        </Flex>
      </Flex>
    </Card>
  )
}
