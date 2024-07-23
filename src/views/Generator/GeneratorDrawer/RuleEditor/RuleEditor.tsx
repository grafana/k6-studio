import { selectSelectedRule, useGeneratorStore } from '@/store/generator'
import { exhaustive } from '@/utils/typescript'
import { CorrelationEditor } from './CorrelationEditor'
import { CustomCodeEditor } from './CustomCodeEditor'
import { Box, Callout, IconButton } from '@radix-ui/themes'
import { Cross2Icon, InfoCircledIcon } from '@radix-ui/react-icons'

export function RuleEditorSwitch() {
  const rule = useGeneratorStore(selectSelectedRule)
  const updateRule = useGeneratorStore((state) => state.updateRule)

  if (!rule) {
    return null
  }

  switch (rule.type) {
    case 'correlation':
      return <CorrelationEditor rule={rule} onChangeRule={updateRule} />
    case 'customCode':
      return <CustomCodeEditor rule={rule} onChangeRule={updateRule} />
    case 'parameterization':
    case 'verification':
      return (
        <Callout.Root>
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>Not implemented yet</Callout.Text>
        </Callout.Root>
      )
    default:
      return exhaustive(rule)
  }
}

export function RuleEditor() {
  const selectRule = useGeneratorStore((store) => store.selectRule)
  const selectedRuleId = useGeneratorStore((store) => store.selectedRuleId)

  return (
    <Box position="relative">
      {selectedRuleId && (
        <Box position="absolute" right="0" top="0">
          <IconButton
            variant="ghost"
            title="close"
            m="2"
            onClick={() => selectRule(null)}
          >
            <Cross2Icon />
          </IconButton>
        </Box>
      )}
      <RuleEditorSwitch />
    </Box>
  )
}
