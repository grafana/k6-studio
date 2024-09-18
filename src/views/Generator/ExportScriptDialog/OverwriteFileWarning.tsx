import { Code, Flex, Button, AlertDialog } from '@radix-ui/themes'
import { useFormContext } from 'react-hook-form'

export function OverwriteFileWarning() {
  const { getValues, setValue } = useFormContext()

  function handleCancelOverwrite() {
    setValue('overwriteFile', false)
  }

  return (
    <>
      <AlertDialog.Description size="2" mb="4">
        A script named <Code>{getValues('scriptName')}</Code> already exists. Do
        you you want to overwrite it?
      </AlertDialog.Description>

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
