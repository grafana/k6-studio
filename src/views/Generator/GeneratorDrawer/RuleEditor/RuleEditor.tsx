import { useNavigate } from 'react-router-dom'
import { Box, Callout, IconButton } from '@radix-ui/themes'

import { selectRuleById, useGeneratorStore } from '@/store/generator'
import { exhaustive } from '@/utils/typescript'
import { CorrelationEditor } from './CorrelationEditor'
import { CustomCodeEditor } from './CustomCodeEditor'
import { Cross2Icon, InfoCircledIcon } from '@radix-ui/react-icons'
import { useGeneratorParams } from '../../Generator.hooks'
import { getRoutePath } from '@/routeMap'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { TestRule } from '@/types/rules'
import { useCallback, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { TestRuleSchema } from '@/schemas/rules'

export function RuleEditorSwitch() {
  const { watch } = useFormContext<TestRule>()
  const ruleType = watch('type')

  switch (ruleType) {
    case 'correlation':
      return <CorrelationEditor />
    case 'customCode':
      return <CustomCodeEditor />
    case 'parameterization':
    case 'verification':
    case 'recording-verification':
      return (
        <Callout.Root>
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>Not implemented yet</Callout.Text>
        </Callout.Root>
      )
    default:
      return exhaustive(ruleType)
  }
}

export function RuleEditor() {
  const { fileName } = useGeneratorParams()
  const navigate = useNavigate()

  const { ruleId } = useGeneratorParams()
  const updateRule = useGeneratorStore((state) => state.updateRule)
  const rule = useGeneratorStore((state) => selectRuleById(state, ruleId))

  const formMethods = useForm<TestRule>({
    resolver: zodResolver(TestRuleSchema),
    defaultValues: rule,
    shouldFocusError: false,
  })

  const { watch, handleSubmit, reset } = formMethods

  const handleClose = () => {
    navigate(
      getRoutePath('generator', { fileName: encodeURIComponent(fileName) })
    )
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
  }, [ruleId])

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box position="relative">
          <Box position="absolute" right="-15px" top="-15px">
            <IconButton
              variant="ghost"
              title="close"
              m="2"
              onClick={handleClose}
            >
              <Cross2Icon />
            </IconButton>
          </Box>
          <RuleEditorSwitch />
        </Box>
      </form>
    </FormProvider>
  )
}
