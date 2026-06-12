import {
  Badge,
  Card,
  Code,
  Flex,
  IconButton,
  Switch,
  Text,
  TextField,
} from '@radix-ui/themes'
import { EyeIcon, EyeOffIcon, LockIcon, XIcon } from 'lucide-react'
import { useState } from 'react'

import { useGeneratorStore } from '@/store/generator'
import { ParameterizationRule } from '@/types/rules'

import { ParamSuggestionMeta } from '../../state/types'

function RecordedValue({
  meta,
}: {
  meta: Pick<ParamSuggestionMeta, 'secret' | 'recordedValue'>
}) {
  const [isRevealed, setIsRevealed] = useState(false)

  if (!meta.secret) {
    return <Code size="2">{meta.recordedValue}</Code>
  }

  return (
    <Flex gap="2" align="center">
      <LockIcon size={14} color="var(--gray-9)" />
      <Code size="2">{isRevealed ? meta.recordedValue : '••••••••'}</Code>
      <IconButton
        size="1"
        variant="ghost"
        color="gray"
        aria-label={isRevealed ? 'Hide value' : 'Reveal value'}
        onClick={() => setIsRevealed((previous) => !previous)}
      >
        {isRevealed ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
      </IconButton>
    </Flex>
  )
}

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
  const deleteRule = useGeneratorStore((state) => state.deleteRule)

  const variableName =
    rule.value.type === 'variable' ? rule.value.variableName : meta.field

  return (
    <Card size="2">
      <Flex direction="column" gap="3">
        <Flex gap="2" align="center" wrap="wrap">
          <Text size="2" weight="bold">
            {meta.field}
          </Text>
          <Badge color="gray" variant="soft">
            <Code size="1" variant="ghost">
              {meta.location.method} {meta.location.path}
            </Code>
            · in:{meta.location.in}
          </Badge>
          <Badge color={meta.confidence === 'high' ? 'green' : 'amber'}>
            {meta.confidence} confidence
          </Badge>
          <Flex flexGrow="1" />
          <Switch
            size="1"
            checked={rule.enabled}
            aria-label={`Enable ${meta.field} rule`}
            onCheckedChange={() => toggleEnableRule(rule.id)}
          />
          <IconButton
            size="1"
            variant="ghost"
            color="gray"
            aria-label={`Remove ${meta.field} rule`}
            onClick={() => deleteRule(rule.id)}
          >
            <XIcon size={14} />
          </IconButton>
        </Flex>
        <Flex gap="6" align="end" wrap="wrap">
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">
              Recorded value
            </Text>
            <Flex css={{ minHeight: 'var(--space-6)' }} align="center">
              <RecordedValue meta={meta} />
            </Flex>
          </Flex>
          <Flex
            direction="column"
            gap="1"
            flexGrow="1"
            css={{ minWidth: 220, maxWidth: 420 }}
          >
            <Text size="1" color="gray">
              Replaced with variable <Code size="1">{variableName}</Code>
            </Text>
            <VariableValueField variableName={variableName} />
          </Flex>
        </Flex>
      </Flex>
    </Card>
  )
}
