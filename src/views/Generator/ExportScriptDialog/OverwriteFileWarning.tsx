import { Code, Flex, Button, AlertDialog } from '@radix-ui/themes'
import { useFormContext } from 'react-hook-form'

import { getScriptNameWithExtension } from './ExportScriptDialog.utils'

export function OverwriteFileWarning() {
  const { getValues, setValue } = useFormContext()

  function handleCancelOverwrite() {
    setValue('overwriteFile', false)
  }

  // TODO: https://github.com/grafana/k6-studio/issues/277
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const scriptName = getScriptNameWithExtension(getValues('scriptName'))

  return (
    <>
      <AlertDialog.Description size="2" mb="4">
        A script named <Code>{scriptName}</Code> already exists. Do you want to
        overwrite it?
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
