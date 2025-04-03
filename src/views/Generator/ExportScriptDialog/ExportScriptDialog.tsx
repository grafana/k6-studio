import { zodResolver } from '@hookform/resolvers/zod'
import { FileTextIcon } from '@radix-ui/react-icons'
import { AlertDialog, Flex } from '@radix-ui/themes'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useLocalStorage } from 'react-use'

import {
  ExportScriptDialogData,
  ExportScriptDialogSchema,
} from '@/schemas/exportScript'
import { useStudioUIStore } from '@/store/ui'

import { getScriptNameWithExtension } from './ExportScriptDialog.utils'
import { OverwriteFileWarning } from './OverwriteFileWarning'
import { ScriptNameForm } from './ScriptNameForm'

interface ExportScriptDialogProps {
  open: boolean
  scriptName: string
  onExport: (scriptName: string) => void
  onOpenChange: (open: boolean) => void
}

export function ExportScriptDialog({
  open,
  scriptName,
  onExport,
  onOpenChange,
}: ExportScriptDialogProps) {
  const scripts = useStudioUIStore((store) => store.scripts)

  const formMethods = useForm<ExportScriptDialogData>({
    resolver: zodResolver(ExportScriptDialogSchema),
    defaultValues: {
      scriptName,
    },
  })

  const [alwaysOverwriteScript, setAlwaysOverwriteScript] = useLocalStorage(
    'alwaysOverwriteScript',
    false
  )
  const { setValue } = formMethods

  useEffect(() => {
    if (!open) {
      return
    }

    setValue('scriptName', scriptName)
    setValue('overwriteFile', false)
  }, [open, scriptName, setValue])

  const onSubmit = (data: ExportScriptDialogData) => {
    const { scriptName: userInput, overwriteFile } = data
    const fileName = getScriptNameWithExtension(userInput)
    const fileExists = Array.from(scripts.keys()).includes(fileName)
    if (fileExists && !overwriteFile && !alwaysOverwriteScript) {
      setValue('overwriteFile', true)
      return
    }

    onExport(fileName)
    onOpenChange(false)
  }

  function handleOpenChange(open: boolean) {
    onOpenChange(open)
    if (!open) {
      setValue('overwriteFile', false)
    }
  }

  const { overwriteFile: showOverwriteWarning } = formMethods.watch()

  return (
    <AlertDialog.Root open={open} onOpenChange={handleOpenChange}>
      <AlertDialog.Content
        size="3"
        maxWidth="450px"
        onEscapeKeyDown={(event) => {
          event.preventDefault()
        }}
      >
        <AlertDialog.Title>
          <Flex align="center" gap="2">
            <FileTextIcon color="orange" width="20px" height="20px" />
            Export script
          </Flex>
        </AlertDialog.Title>

        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            {showOverwriteWarning ? (
              <OverwriteFileWarning />
            ) : (
              <ScriptNameForm
                alwaysOverwriteScript={!!alwaysOverwriteScript}
                setAlwaysOverwriteScript={setAlwaysOverwriteScript}
              />
            )}
          </form>
        </FormProvider>
      </AlertDialog.Content>
    </AlertDialog.Root>
  )
}
