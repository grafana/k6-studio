import { css } from '@emotion/react'
import { Box, DropdownMenu, Flex, Inset, Popover, Text } from '@radix-ui/themes'
import { MonitorIcon, PlusIcon, ServerCogIcon, VideoIcon } from 'lucide-react'

import { RichDropdownMenuItem } from '@/components/RichDropdownMenuItem'

import { VerticalTabButton } from './VerticalTabButton'

export function CreateNewPopover() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <div>
          <VerticalTabButton icon={<PlusIcon />} tooltip="Create new" />
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content size="1">
        <RichDropdownMenuItem
          label="Recording"
          icon={<VideoIcon />}
          description="Capture HTTP traffic and browser events"
        />
        <RichDropdownMenuItem
          label="HTTP test"
          icon={<ServerCogIcon />}
          description="Create a test from HTTP requests using rules"
        />
        <RichDropdownMenuItem
          label="Browser test"
          icon={<MonitorIcon />}
          description="Create a test simulating browser interactions"
        />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )

  return (
    <Popover.Root>
      <Popover.Trigger>
        <VerticalTabButton icon={<PlusIcon />} tooltip="Create new" />
      </Popover.Trigger>
      <Popover.Content size="1">
        <Inset>
          <Flex direction="column">
            <Box
              p="2"
              css={css`
                font-size: var(--font-size-1);
                font-weight: 600;
                text-transform: uppercase;
                border-bottom: 1px solid var(--gray-4);
              `}
            >
              Create new
            </Box>
            <Option
              icon={<VideoIcon />}
              label="Recording"
              description="Capture HTTP traffic and browser events"
              color="accent"
            />
            <Option
              icon={<ServerCogIcon />}
              label="HTTP test"
              description="Create a test from HTTP requests using rules"
              color="accent"
            />
            <Option
              icon={<MonitorIcon />}
              label="Browser test"
              description="Create a test simulating browser interactions"
              color="indigo"
            />
          </Flex>
        </Inset>
      </Popover.Content>
    </Popover.Root>
  )
}

function Option({
  icon,
  label,
  description,
  color,
}: {
  icon: React.ReactNode
  label: string
  description: string
  color: string
}) {
  return (
    <Flex
      css={css`
        &:not(:last-child) {
          border-bottom: 1px solid var(--gray-4);
        }
      `}
      p="2"
      gap="2"
    >
      <div
        css={css`
          width: 24px;
          height: 24px;
          padding: var(--space-1);
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--${color}-3);
          color: var(--${color}-11);
          border-radius: var(--radius-2);
        `}
      >
        {icon}
      </div>{' '}
      <div>
        <Text as="p" weight="bold">
          {label}
        </Text>
        <Text as="p" color="gray">
          {description}
        </Text>
      </div>
    </Flex>
  )
}
