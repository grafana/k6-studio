import { zodResolver } from '@hookform/resolvers/zod'
import {
  Badge,
  Box,
  Card,
  Code,
  Flex,
  IconButton,
  Switch,
  Text,
} from '@radix-ui/themes'
import { EyeIcon, EyeOffIcon, LockIcon, XIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import type { z } from 'zod'

import { ParameterizationRuleSchema } from '@/schemas/generator'
import { useGeneratorStore } from '@/store/generator'
import { ParameterizationRule } from '@/types/rules'
import { ValueEditor } from '@/views/Generator/RuleEditor/ParameterizationEditor/ValueEditor'

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

function ReplacementEditor({ rule }: { rule: ParameterizationRule }) {
  const updateRule = useGeneratorStore((state) => state.updateRule)

  const formMethods = useForm<
    z.input<typeof ParameterizationRuleSchema>,
    unknown,
    ParameterizationRule
  >({
    resolver: zodResolver(ParameterizationRuleSchema),
    defaultValues: rule,
    shouldFocusError: false,
  })

  const { watch, handleSubmit } = formMethods

  const onSubmit = useCallback(
    (data: ParameterizationRule) => {
      updateRule(data)
    },
    [updateRule]
  )

  // Persist valid edits to the store as the user types.
  useEffect(() => {
    const subscription = watch(() => handleSubmit(onSubmit)())
    return () => subscription.unsubscribe()
  }, [watch, handleSubmit, onSubmit])

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <ValueEditor />
      </form>
    </FormProvider>
  )
}

interface ParamCardProps {
  meta: ParamSuggestionMeta
  rule: ParameterizationRule
}

export function ParamCard({ meta, rule }: ParamCardProps) {
  const toggleEnableRule = useGeneratorStore((state) => state.toggleEnableRule)
  const deleteRule = useGeneratorStore((state) => state.deleteRule)

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
        <Flex gap="4" align="start">
          <Flex direction="column" gap="1" width="40%">
            <Text size="1" color="gray">
              Recorded value
            </Text>
            <RecordedValue meta={meta} />
          </Flex>
          <Box flexGrow="1">
            <ReplacementEditor rule={rule} />
          </Box>
        </Flex>
      </Flex>
    </Card>
  )
}
