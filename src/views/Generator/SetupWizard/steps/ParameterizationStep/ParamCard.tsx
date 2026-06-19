import {
  Badge,
  Box,
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

interface ParamCardProps {
  meta: ParamSuggestionMeta
  rule: ParameterizationRule
}

export function ParamCard({ meta, rule }: ParamCardProps) {
  const toggleEnableRule = useGeneratorStore((state) => state.toggleEnableRule)

  const variableName =
    rule.value.type === 'variable' ? rule.value.variableName : meta.field

  return (
    <Card size="1">
      <Flex
        direction="column"
        gap="2"
        css={{ opacity: rule.enabled ? 1 : 0.6 }}
      >
        <Flex gap="2" align="center">
          <Text size="2" weight="bold" css={{ whiteSpace: 'nowrap' }}>
            {meta.field}
          </Text>
          <Badge color="gray" variant="soft">
            in:{meta.location.in}
          </Badge>
          <Flex flexGrow="1" />
          <Switch
            size="1"
            checked={rule.enabled}
            aria-label={`Enable ${meta.field} rule`}
            onCheckedChange={() => toggleEnableRule(rule.id)}
          />
        </Flex>
        <Flex gap="2" align="center" wrap="wrap">
          <Text size="1" color="gray" css={{ whiteSpace: 'nowrap' }}>
            Variable <Code size="1">{variableName}</Code>
          </Text>
          <Box css={{ width: '100%', maxWidth: 260 }}>
            <VariableValueField variableName={variableName} />
          </Box>
        </Flex>
      </Flex>
    </Card>
  )
}
