import {
  Flex,
  IconButton,
  Popover,
  Switch,
  Text,
  Tooltip,
} from '@radix-ui/themes'
import { SettingsIcon } from 'lucide-react'
import { useId, useState } from 'react'

import { LocatorClickAction } from '@/schemas/browserTest'

interface OptionSwitchProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function OptionSwitch({ label, checked, onChange }: OptionSwitchProps) {
  const switchId = useId()

  return (
    <Flex asChild align="center" justify="between" gap="3">
      <label htmlFor={switchId}>
        <Text size="1" weight="medium">
          {label}
        </Text>
        <Switch
          id={switchId}
          size="1"
          checked={checked}
          onCheckedChange={onChange}
        />
      </label>
    </Flex>
  )
}

interface ClickOptionsFormProps {
  options: LocatorClickAction['options']
  onChange: (
    options: Partial<NonNullable<LocatorClickAction['options']>>
  ) => void
}

export function ClickOptionsForm({ options, onChange }: ClickOptionsFormProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  return (
    <Popover.Root open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <Tooltip content="Options">
        <Popover.Trigger>
          <IconButton
            aria-label="Edit options"
            size="1"
            variant="ghost"
            color="gray"
          >
            <SettingsIcon />
          </IconButton>
        </Popover.Trigger>
      </Tooltip>
      <Popover.Content align="start" size="1" width="240px">
        <Flex direction="column" gap="2">
          <OptionSwitch
            label="Wait for navigation"
            checked={options?.waitForNavigation === true}
            onChange={(checked) => {
              onChange({ ...(options ?? {}), waitForNavigation: checked })
            }}
          />
          <OptionSwitch
            label="Continues in new tab"
            checked={options?.switchesToNewPage === true}
            onChange={(checked) => {
              onChange({ ...(options ?? {}), switchesToNewPage: checked })
            }}
          />
        </Flex>
      </Popover.Content>
    </Popover.Root>
  )
}
