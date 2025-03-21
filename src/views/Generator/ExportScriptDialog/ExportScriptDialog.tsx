import { zodResolver } from '@hookform/resolvers/zod'
import { FileTextIcon } from '@radix-ui/react-icons'
import { AlertDialog, Flex } from '@radix-ui/themes'
import log from 'electron-log/renderer'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useLocalStorage } from 'react-use'

import {
  ExportScriptDialogData,
  ExportScriptDialogSchema,
} from '@/schemas/exportScript'
import { useGeneratorStore } from '@/store/generator'
import { useStudioUIStore } from '@/store/ui'
import { useToast } from '@/store/ui/useToast'

import {
  useGeneratorParams,
  useUpdateValueInGeneratorFile,
} from '../Generator.hooks'

import { getScriptNameWithExtension } from './ExportScriptDialog.utils'
import { OverwriteFileWarning } from './OverwriteFileWarning'
import { ScriptNameForm } from './ScriptNameForm'

export function ExportScriptDialog({
  open,
  onExport,
  onOpenChange,
}: {
  open: boolean
  onExport: (scriptName: string) => void
  onOpenChange: (open: boolean) => void
}) {
  const scriptName = useGeneratorStore((store) => store.scriptName)
  const setScriptName = useGeneratorStore((store) => store.setScriptName)
  const scripts = useStudioUIStore((store) => store.scripts)
  const showToast = useToast()

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
  const { fileName } = useGeneratorParams()
  const { mutateAsync: updateGeneratorFile } =
    useUpdateValueInGeneratorFile(fileName)

  useEffect(() => {
    if (!open) return
    setValue('scriptName', scriptName)
    setValue('overwriteFile', false)
  }, [open, scriptName, setValue])

  const onSubmit = async (data: ExportScriptDialogData) => {
    try {
      const { scriptName: userInput, overwriteFile } = data
      const fileName = getScriptNameWithExtension(userInput)
      const fileExists = Array.from(scripts.keys()).includes(fileName)
      if (fileExists && !overwriteFile && !alwaysOverwriteScript) {
        setValue('overwriteFile', true)
        return
      }

      await updateGeneratorFile({ key: 'scriptName', value: fileName })
      setScriptName(fileName)
      onExport(fileName)
      onOpenChange(false)
    } catch (error) {
      showToast({
        status: 'error',
        title: 'Failed to update script name',
      })
      log.error(error)
    }
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
