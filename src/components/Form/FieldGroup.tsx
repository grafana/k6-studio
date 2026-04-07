import { ErrorMessage } from '@hookform/error-message'
import * as Label from '@radix-ui/react-label'
import { Box, BoxProps, Flex, Text } from '@radix-ui/themes'
import { InfoIcon } from 'lucide-react'
import { FieldErrors } from 'react-hook-form'

import { PopoverTooltip } from '../PopoverTooltip'

import { FieldError } from './FieldError'

type FieldGroupProps = BoxProps & {
  children: React.ReactNode
  errors?: FieldErrors
  name: string
  label?: React.ReactNode
  labelSize?: '1' | '2' | '3'
  hint?: React.ReactNode
  hintType?: 'tooltip' | 'text'
}

export function FieldGroup({
  children,
  label,
  labelSize = '2',
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
              <Text size={labelSize} weight="medium">
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
