import { useCallback, useEffect } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Callout, IconButton, Tooltip } from '@radix-ui/themes'
import { Cross2Icon, InfoCircledIcon } from '@radix-ui/react-icons'

import { useGeneratorStore } from '@/store/generator'
import { exhaustive } from '@/utils/typescript'
import { CorrelationEditor } from './CorrelationEditor'
import { CustomCodeEditor } from './CustomCodeEditor'
import { TestRule } from '@/types/rules'
import { TestRuleSchema } from '@/schemas/rules'
import { ParameterizationEditor } from './ParameterizationEditor/ParameterizationEditor'

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
        <Callout.Root>
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
        <Box position="relative">
          <Box position="absolute" right="-15px" top="-15px">
            <Tooltip content="Close">
              <IconButton
                variant="ghost"
                title="close"
                m="3"
                onClick={handleClose}
              >
                <Cross2Icon />
              </IconButton>
            </Tooltip>
          </Box>
          <RuleEditorSwitch />
        </Box>
      </form>
    </FormProvider>
  )
}
