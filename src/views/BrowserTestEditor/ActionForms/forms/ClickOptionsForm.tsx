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

import { LocatorClickAction } from '@/main/runner/schema'

interface ClickOptionsFormProps {
  options: LocatorClickAction['options']
  onChange: (
    options: Partial<NonNullable<LocatorClickAction['options']>>
  ) => void
}

export function ClickOptionsForm({ options, onChange }: ClickOptionsFormProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const switchId = useId()

  const waitForNavigation = options?.waitForNavigation === true

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
        <Flex asChild align="center" justify="between" gap="3">
          <label htmlFor={switchId}>
            <Text size="1" weight="medium">
              Wait for navigation
            </Text>
            <Switch
              id={switchId}
              size="1"
              checked={waitForNavigation}
              onCheckedChange={(checked) => {
                onChange({ ...(options ?? {}), waitForNavigation: checked })
              }}
            />
          </label>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  )
}
