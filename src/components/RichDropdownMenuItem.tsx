import { css } from '@emotion/react'
import { DropdownMenu, Flex, Text } from '@radix-ui/themes'
import { ComponentProps, ReactNode } from 'react'

interface RichDropdownMenuItemProps extends Omit<
  ComponentProps<typeof DropdownMenu.Item>,
  'children'
> {
  label: string
  icon?: ReactNode
  description?: string
}

export function RichDropdownMenuItem({
  label,
  icon,
  description,
  disabled,
  onClick,
}: RichDropdownMenuItemProps) {
  return (
    <DropdownMenu.Item
      disabled={disabled}
      onClick={onClick}
      css={css`
        height: auto;
      `}
    >
      <Flex py="1" maxWidth="340px" gap="3" align="center">
        {icon}
        <Flex direction="column" align="start">
          <Text weight="bold">{label}</Text>
          {description && <Text size="1">{description}</Text>}
        </Flex>
      </Flex>
    </DropdownMenu.Item>
  )
}
