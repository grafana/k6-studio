import { FileTextIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Code,
  AlertDialog,
  Flex,
  Text,
  TextField,
} from '@radix-ui/themes'
import { scriptExists } from './Generator.utils'
import { useForm } from 'react-hook-form'
import {
  ExportScriptDialogData,
  ExportScriptDialogSchema,
} from '@/schemas/exportScript'
import { zodResolver } from '@hookform/resolvers/zod'
import { FieldGroup } from '@/components/Form'

export function ExportScriptDialog({
  open,
  onExport,
  onOpenChange,
}: {
  open: boolean
  onExport: (scriptName: string) => void
  onOpenChange: (open: boolean) => void
}) {
  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ExportScriptDialogData>({
    resolver: zodResolver(ExportScriptDialogSchema),
    defaultValues: {
      scriptName: 'my-script',
    },
  })

  function handleCancelOverwrite() {
    setValue('overwriteFile', false)
  }

  const onSubmit = async (data: ExportScriptDialogData) => {
    const { scriptName, overwriteFile } = data
    const fileName = `${scriptName}.js`
    const fileExists = await scriptExists(fileName)
    if (fileExists && !overwriteFile) {
      setValue('overwriteFile', true)
      return
    }

    setValue('overwriteFile', false)
    onExport(fileName)
    onOpenChange(false)
  }

  const { overwriteFile: showOverwriteWarning } = getValues()

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Content size="3" maxWidth="450px">
        <AlertDialog.Title>
          <Flex align="center" gap="2">
            <FileTextIcon color="orange" width="20px" height="20px" />
            Export script
          </Flex>
        </AlertDialog.Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          {showOverwriteWarning && (
            <>
              <Box mb="5">
                <Text>
                  A script named <Code>{getValues('scriptName')}</Code> already
                  exists. Do you you want to overwrite it?
                </Text>
              </Box>
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
          )}

          {!showOverwriteWarning && (
            <>
              <Box mb="5">
                <FieldGroup
                  name="scriptName"
                  label="Script name"
                  errors={errors}
                >
                  <TextField.Root
                    placeholder="my-script"
                    {...register('scriptName')}
                  />
                </FieldGroup>
              </Box>

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
          )}
        </form>
      </AlertDialog.Content>
    </AlertDialog.Root>
  )
}
