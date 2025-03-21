import { css } from '@emotion/react'
import { Flex, TextField, Button } from '@radix-ui/themes'
import { Controller, FieldErrors } from 'react-hook-form'

import { FieldGroup } from './FieldGroup'

type FileUploadInputProps = {
  name: string
  label: string
  buttonText: string
  hint?: string
  errors?: FieldErrors
  disabled?: boolean
  onSelectFile: () => void
}

export const FileUploadInput = ({
  onSelectFile,
  name,
  hint,
  label,
  errors,
  disabled,
  buttonText,
}: FileUploadInputProps) => {
  return (
    <Flex>
      <Controller
        name={name}
        render={({ field }) => (
          <FieldGroup
            flexGrow="1"
            name={name}
            label={label}
            errors={errors ?? {}}
            hint={hint}
            hintType="text"
          >
            <Flex gap="2" width="100%">
              <TextField.Root
                css={css`
                  flex: 1;
                `}
                type="text"
                disabled={disabled}
                onChange={field.onChange}
                name={field.name}
                // TODO: https://github.com/grafana/k6-studio/issues/277
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                value={field.value}
              />
              <Button disabled={disabled} onClick={onSelectFile} type="button">
                {buttonText}
              </Button>
            </Flex>
          </FieldGroup>
        )}
      />
    </Flex>
  )
}
