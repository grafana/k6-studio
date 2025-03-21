import { Switch, Tooltip } from '@radix-ui/themes'

import { useGeneratorStore } from '@/store/generator'

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
      {/*
        The extra span is needed because of the following issue
        https://github.com/radix-ui/themes/issues/440
      */}
      <span css={{ lineHeight: 1 }}>
        <Switch
          size="1"
          aria-label={isEnabled ? 'Disable rule' : 'Enable rule'}
          checked={isEnabled}
          onCheckedChange={() => {
            handleToggleEnabled()
          }}
          variant="soft"
          color="gray"
          // Prevent toggle from opening the rule editor
          onClick={(e) => e.stopPropagation()}
        />
      </span>
    </Tooltip>
  )
}
