import { InfoCircledIcon } from '@radix-ui/react-icons'
import * as Label from '@radix-ui/react-label'
import { Box, BoxProps, Flex, Tooltip, Text } from '@radix-ui/themes'
import { ErrorMessage } from '@hookform/error-message'
import { FieldErrors } from 'react-hook-form'
import { FieldError } from './FieldError'

type FieldGroupProps = BoxProps & {
  children: React.ReactNode
  errors: FieldErrors
  name: string
  label?: React.ReactNode
  hint?: React.ReactNode
  hintType?: 'tooltip' | 'text'
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
        <Label.Root htmlFor={name}>
          <Flex align="center" gap="1" mb="1">
            <Text size="2" weight="medium">
              {label}
            </Text>
            {hint && hintType === 'tooltip' && (
              <Tooltip content={hint}>
                <InfoCircledIcon />
              </Tooltip>
            )}
          </Flex>
          {hint && hintType === 'text' && (
            <Text size="1" mb="2" as="p">
              {hint}
            </Text>
          )}
        </Label.Root>
      )}
      <Box>{children}</Box>
      <ErrorMessage errors={errors} name={name} as={FieldError} />
    </Box>
  )
}
