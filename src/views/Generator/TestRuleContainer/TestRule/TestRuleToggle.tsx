import { useGeneratorStore } from '@/store/generator'
import { Switch, Tooltip } from '@radix-ui/themes'

interface TestRuleToggleProps {
  ruleId: string
  isEnabled: boolean
}

export function TestRuleToggle({ ruleId, isEnabled }: TestRuleToggleProps) {
  const toggleEnableRule = useGeneratorStore((state) => state.toggleEnableRule)

  const handleToggleEnabled = () => {
    toggleEnableRule(ruleId)
  }

  return (
    <Tooltip content={isEnabled ? 'Disable rule' : 'Enable rule'}>
      <Switch
        size="1"
        aria-label={isEnabled ? 'Disable rule' : 'Enable rule'}
        checked={isEnabled}
        onCheckedChange={() => {
          handleToggleEnabled()
        }}
        variant="soft"
        color="gray"
      />
    </Tooltip>
  )
}
