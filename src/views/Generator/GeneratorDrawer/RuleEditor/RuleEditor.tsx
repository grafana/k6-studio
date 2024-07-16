import { useGeneratorStore, useSelectedRule } from '@/hooks/useGeneratorStore'
import { exhaustive } from '@/utils/typescript'
import { CorrelationEditor } from './CorrelationEditor'
import { CustomCodeEditor } from './CustomCodeEditor'
import { Callout } from '@radix-ui/themes'
import { InfoCircledIcon } from '@radix-ui/react-icons'

export function RuleEditor() {
  const rule = useSelectedRule()
  const { updateRule } = useGeneratorStore()

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
