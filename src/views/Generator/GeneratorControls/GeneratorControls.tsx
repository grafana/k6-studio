import { useState } from 'react'
import { DropdownMenu, Flex, IconButton } from '@radix-ui/themes'

import { useScriptPreview } from '@/hooks/useScriptPreview'
import { ValidatorDialog } from '../ValidatorDialog'
import { ExportScriptDialog } from '../ExportScriptDialog'
import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { useGeneratorParams, useScriptExport } from '../Generator.hooks'
import { useNavigate } from 'react-router-dom'
import { getRoutePath } from '@/routeMap'
import { ButtonWithTooltip } from '@/components/ButtonWithTooltip'
import { getFileNameWithoutExtension } from '@/utils/file'
import { RecordingSelector } from '../RecordingSelector'
import { useGeneratorStore } from '@/store/generator'

interface GeneratorControlsProps {
  onSave: () => void
  isDirty: boolean
}

export function GeneratorControls({ onSave, isDirty }: GeneratorControlsProps) {
  const scriptName = useGeneratorStore((store) => store.scriptName)

  const [isValidatorDialogOpen, setIsValidatorDialogOpen] = useState(false)
  const [isExportScriptDialogOpen, setIsExportScriptDialogOpen] =
    useState(false)
  const { fileName } = useGeneratorParams()
  const { preview, hasError } = useScriptPreview()
  const isScriptExportable = !hasError && !!preview
  const navigate = useNavigate()

  const handleDeleteGenerator = async () => {
    await window.studio.ui.deleteFile({
      type: 'generator',
      fileName,
      displayName: getFileNameWithoutExtension(fileName),
    })

    navigate(getRoutePath('home'))
  }

  const handleExportScript = useScriptExport(fileName)

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
              scriptName={scriptName}
              onExport={handleExportScript}
              onOpenChange={setIsExportScriptDialogOpen}
            />
          </>
        )}
      </Flex>
    </>
  )
}
