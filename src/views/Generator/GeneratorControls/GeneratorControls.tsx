import { useState } from 'react'
import { DropdownMenu, Flex, IconButton } from '@radix-ui/themes'

import { useScriptPreview } from '@/hooks/useScriptPreview'
import { exportScript } from '../Generator.utils'
import { ValidatorDialog } from '../ValidatorDialog'
import { ExportScriptDialog } from '../ExportScriptDialog'
import { DotsVerticalIcon } from '@radix-ui/react-icons'
import {
  useGeneratorParams,
  useUpdateValueInGeneratorFile,
} from '../Generator.hooks'
import { useNavigate } from 'react-router-dom'
import { getRoutePath } from '@/routeMap'
import { ButtonWithTooltip } from '@/components/ButtonWithTooltip'
import { getFileNameWithoutExtension } from '@/utils/file'
import { RecordingSelector } from '../RecordingSelector'
import { useToast } from '@/store/ui/useToast'
import log from 'electron-log/renderer'

interface GeneratorControlsProps {
  onSave: () => void
  isDirty: boolean
}

export function GeneratorControls({ onSave, isDirty }: GeneratorControlsProps) {
  const [isValidatorDialogOpen, setIsValidatorDialogOpen] = useState(false)
  const [isExportScriptDialogOpen, setIsExportScriptDialogOpen] =
    useState(false)
  const { fileName } = useGeneratorParams()
  const { preview, hasError } = useScriptPreview()
  const isScriptExportable = !hasError && !!preview
  const navigate = useNavigate()

  const { mutateAsync: updateGeneratorFile } =
    useUpdateValueInGeneratorFile(fileName)

  const showToast = useToast()

  const handleDeleteGenerator = async () => {
    await window.studio.ui.deleteFile({
      type: 'generator',
      fileName,
      displayName: getFileNameWithoutExtension(fileName),
    })

    navigate(getRoutePath('home'))
  }

  const handleExportScript = async (fileName: string) => {
    try {
      await exportScript(fileName)
    } catch (error) {
      log.error(error)

      showToast({
        title: 'Failed to export script',
        status: 'error',
      })
    }

    try {
      await updateGeneratorFile({ key: 'scriptName', value: fileName })
    } catch (error) {
      log.error(error)

      showToast({
        title: 'Failed to update script name',
        status: 'error',
      })
    }
  }

  return (
    <>
      <RecordingSelector />
      <Flex align="center" justify="between" gap="2" ml="2">
        <ButtonWithTooltip
          onClick={onSave}
          disabled={!isDirty}
          tooltip={!isDirty ? 'Changes saved' : ''}
        >
          Save generator
        </ButtonWithTooltip>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <IconButton variant="ghost" color="gray">
              <DotsVerticalIcon />
            </IconButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item
              onSelect={() => setIsValidatorDialogOpen(true)}
              disabled={!isScriptExportable}
            >
              Validate script
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={() => setIsExportScriptDialogOpen(true)}
              disabled={!isScriptExportable}
            >
              Export script
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item onSelect={handleDeleteGenerator} color="red">
              Delete generator
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        {isScriptExportable && (
          <>
            <ValidatorDialog
              script={preview}
              open={isValidatorDialogOpen}
              onOpenChange={setIsValidatorDialogOpen}
            />
            <ExportScriptDialog
              open={isExportScriptDialogOpen}
              onExport={handleExportScript}
              onOpenChange={setIsExportScriptDialogOpen}
            />
          </>
        )}
      </Flex>
    </>
  )
}
