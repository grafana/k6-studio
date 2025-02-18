import { useCallback, useEffect } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, Callout } from '@radix-ui/themes'
import { ChevronLeftIcon, InfoCircledIcon } from '@radix-ui/react-icons'

import { useGeneratorStore } from '@/store/generator'
import { exhaustive } from '@/utils/typescript'
import { CorrelationEditor } from './CorrelationEditor'
import { CustomCodeEditor } from './CustomCodeEditor'
import { TestRule } from '@/types/rules'
import { TestRuleSchema } from '@/schemas/generator'
import { ParameterizationEditor } from './ParameterizationEditor/ParameterizationEditor'
import { StickyPanelHeader } from '../TestRuleContainer/StickyPanelHeader'

export function RuleEditorSwitch() {
  const { watch } = useFormContext<TestRule>()
  const ruleType = watch('type')

  switch (ruleType) {
    case 'correlation':
      return <CorrelationEditor />
    case 'customCode':
      return <CustomCodeEditor />
    case 'parameterization':
      return <ParameterizationEditor />

    case 'verification':
      return (
        <Callout.Root mb="4">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            Verification rule configuration is coming soon
          </Callout.Text>
        </Callout.Root>
      )
    default:
      return exhaustive(ruleType)
  }
}

function RuleDisabledWarning() {
  return (
    <Callout.Root mb="4">
      <Callout.Icon>
        <InfoCircledIcon />
      </Callout.Icon>
      <Callout.Text>This rule is currently disabled.</Callout.Text>
    </Callout.Root>
  )
}

interface RuleEditorProps {
  rule: TestRule
}

export function RuleEditor({ rule }: RuleEditorProps) {
  const setSelectedRuleId = useGeneratorStore(
    (state) => state.setSelectedRuleId
  )

  const updateRule = useGeneratorStore((state) => state.updateRule)

  const formMethods = useForm<TestRule>({
    resolver: zodResolver(TestRuleSchema),
    defaultValues: rule,
    shouldFocusError: false,
  })

  const { watch, handleSubmit, reset } = formMethods

  const handleClose = () => {
    setSelectedRuleId(null)
  }

  const onSubmit = useCallback(
    (data: TestRule) => {
      updateRule(data)
    },
    [updateRule]
  )

  // Submit onChange
  useEffect(() => {
    const subscription = watch(() => handleSubmit(onSubmit)())
    return () => subscription.unsubscribe()
  }, [watch, handleSubmit, onSubmit])

  // Reset form when switching rules
  useEffect(() => {
    reset(rule)
    // TODO: fix infinite loop when including all dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rule.id])

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <StickyPanelHeader>
          <Button onClick={handleClose} variant="ghost" color="gray" size="1">
            <ChevronLeftIcon />
            Back to rule list
          </Button>
        </StickyPanelHeader>
        <Box p="2" pr="4" css={{ borderTop: '1px solid var(--gray-3)' }}>
          {!rule.enabled && <RuleDisabledWarning />}
          <RuleEditorSwitch />
        </Box>
      </form>
    </FormProvider>
  )
}
