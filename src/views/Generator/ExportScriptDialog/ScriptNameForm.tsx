import {
  Box,
  TextField,
  Flex,
  AlertDialog,
  Button,
  Checkbox,
  Text,
} from '@radix-ui/themes'
import { Dispatch } from 'react'
import { useFormContext } from 'react-hook-form'

import { FieldGroup } from '@/components/Form'

type ScriptNameFormProps = {
  setAlwaysOverwriteScript: Dispatch<boolean>
  alwaysOverwriteScript: boolean
}

export function ScriptNameForm({
  setAlwaysOverwriteScript,
  alwaysOverwriteScript,
}: ScriptNameFormProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <>
      <AlertDialog.Description size="2" mb="4">
        Choose a descriptive filename to help you identify your work later. Once
        you&apos;ve named your script, click Export to save it.
      </AlertDialog.Description>

      <Box>
        <FieldGroup name="scriptName" label="Script name" errors={errors}>
          <TextField.Root
            placeholder="my-script.js"
            {...register('scriptName')}
          />
        </FieldGroup>
      </Box>

      <Flex gap="2" my="4">
        <Text size="2" as="label">
          <Checkbox
            checked={alwaysOverwriteScript}
            onCheckedChange={(checked) => setAlwaysOverwriteScript(!!checked)}
          />{' '}
          Automatically overwrite existing script
        </Text>
      </Flex>

      <Flex justify="end" gap="2">
        <AlertDialog.Cancel>
          <Button variant="outline" color="orange">
            Cancel
          </Button>
        </AlertDialog.Cancel>

        <Button color="orange" type="submit">
          Export
        </Button>
      </Flex>
    </>
  )
}
