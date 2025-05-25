import { ErrorMessage } from '@hookform/error-message'
import * as Label from '@radix-ui/react-label'
import { Box, BoxProps, Flex, Tooltip, Text, Popover } from '@radix-ui/themes'
import { InfoIcon } from 'lucide-react'
import { FieldErrors } from 'react-hook-form'

import { FieldError } from './FieldError'

type FieldGroupProps = BoxProps & {
  children: React.ReactNode
  errors?: FieldErrors
  name: string
  label?: React.ReactNode
  hint?: React.ReactNode
  hintType?: 'tooltip' | 'text'
}

function PopoverTooltip({
  children,
  content,
}: {
  children: React.ReactNode
  content: React.ReactNode
}) {
  return (
    <Popover.Root>
      <Popover.Trigger>{children}</Popover.Trigger>
      <Popover.Content side="top" size="1">
        {typeof content === 'string' ? (
          <Text size="1">{content}</Text>
        ) : (
          content
        )}
      </Popover.Content>
    </Popover.Root>
  )
}

export function FieldGroup({
  children,
  label,
  name,
  errors,
  hint,
  hintType = 'tooltip',
  ...props
}: FieldGroupProps) {
  return (
    <Box mb="3" {...props}>
      {label && (
        <>
          <Flex align="center" gap="1" mb="1">
            <Label.Root htmlFor={name}>
              <Text size="2" weight="medium">
                {label}
              </Text>
            </Label.Root>
            {hint && hintType === 'tooltip' && (
              <PopoverTooltip content={hint}>
                <InfoIcon />
              </PopoverTooltip>
            )}
          </Flex>
          {hint && hintType === 'text' && (
            <Text size="1" mb="2" as="p" color="gray">
              {hint}
            </Text>
          )}
        </>
      )}
      <Box>{children}</Box>
      {errors && <ErrorMessage errors={errors} name={name} as={FieldError} />}
    </Box>
  )
}
