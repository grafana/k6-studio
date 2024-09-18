import {
  Code,
  Flex,
  Button,
  AlertDialog,
  Checkbox,
  Text,
} from '@radix-ui/themes'
import { Dispatch } from 'react'
import { useFormContext } from 'react-hook-form'

type OverwriteFileWarningProps = {
  setAlwaysOverwriteScript: Dispatch<boolean>
}

export function OverwriteFileWarning({
  setAlwaysOverwriteScript,
}: OverwriteFileWarningProps) {
  const { getValues, setValue } = useFormContext()

  function handleCancelOverwrite() {
    setValue('overwriteFile', false)
    setAlwaysOverwriteScript(false)
  }

  return (
    <>
      <AlertDialog.Description size="2" mb="4">
        A script named <Code>{getValues('scriptName')}</Code> already exists. Do
        you you want to overwrite it?
      </AlertDialog.Description>

      <Flex gap="2" my="4">
        <Text size="2" as="label">
          <Checkbox
            onCheckedChange={(checked) => setAlwaysOverwriteScript(!!checked)}
          />{' '}
          Always overwrite without asking
        </Text>
      </Flex>

      <Flex justify="end" gap="2">
        <Button
          variant="outline"
          color="orange"
          onClick={handleCancelOverwrite}
        >
          No
        </Button>

        <Button color="orange" type="submit">
          Yes
        </Button>
      </Flex>
    </>
  )
}
