import { FileTextIcon } from '@radix-ui/react-icons'
import { AlertDialog, Flex } from '@radix-ui/themes'
import { scriptExists } from '../Generator.utils'
import { FormProvider, useForm } from 'react-hook-form'
import {
  ExportScriptDialogData,
  ExportScriptDialogSchema,
} from '@/schemas/exportScript'
import { zodResolver } from '@hookform/resolvers/zod'
import { OverwriteFileWarning } from './OverwriteFileWarning'
import { ScriptNameForm } from './ScriptNameForm'
import { useLocalStorage } from 'react-use'

export function ExportScriptDialog({
  open,
  onExport,
  onOpenChange,
}: {
  open: boolean
  onExport: (scriptName: string) => void
  onOpenChange: (open: boolean) => void
}) {
  const formMethods = useForm<ExportScriptDialogData>({
    resolver: zodResolver(ExportScriptDialogSchema),
    defaultValues: {
      scriptName: 'my-script',
    },
  })
  const [alwaysOverwriteScript, setAlwaysOverwriteScript] = useLocalStorage(
    'alwaysOverwriteScript',
    false
  )
  const { setValue } = formMethods

  const onSubmit = async (data: ExportScriptDialogData) => {
    const { scriptName, overwriteFile } = data
    const fileName = `${scriptName}.js`
    const fileExists = await scriptExists(fileName)
    if (fileExists && !overwriteFile && !alwaysOverwriteScript) {
      setValue('overwriteFile', true)
      return
    }

    setValue('overwriteFile', false)
    onExport(fileName)
    onOpenChange(false)
  }

  const { overwriteFile: showOverwriteWarning } = formMethods.watch()

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Content size="3" maxWidth="450px">
        <AlertDialog.Title>
          <Flex align="center" gap="2">
            <FileTextIcon color="orange" width="20px" height="20px" />
            Export script
          </Flex>
        </AlertDialog.Title>

        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            {showOverwriteWarning ? (
              <OverwriteFileWarning
                setAlwaysOverwriteScript={setAlwaysOverwriteScript}
              />
            ) : (
              <ScriptNameForm />
            )}
          </form>
        </FormProvider>
      </AlertDialog.Content>
    </AlertDialog.Root>
  )
}
