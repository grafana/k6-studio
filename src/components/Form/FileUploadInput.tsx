import { Flex, TextField, Button } from '@radix-ui/themes'
import { FieldGroup } from './FieldGroup'
import { Controller, FieldErrors } from 'react-hook-form'

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
            <TextField.Root
              type="text"
              disabled={disabled}
              onChange={field.onChange}
              name={field.name}
              value={field.value}
            />
          </FieldGroup>
        )}
      />

      <Button
        ml="2"
        disabled={disabled}
        onClick={onSelectFile}
        style={{
          marginTop: 48,
        }}
      >
        {buttonText}
      </Button>
    </Flex>
  )
}
