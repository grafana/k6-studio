import { useState } from 'react'
import { DropdownMenu, IconButton } from '@radix-ui/themes'

import { useScriptPreview } from '@/hooks/useScriptPreview'
import { exportScript } from '../Generator.utils'
import { ValidatorDialog } from './ValidatorDialog'
import { ExportScriptDialog } from '../ExportScriptDialog'
import { CheckCircledIcon, DotsVerticalIcon } from '@radix-ui/react-icons'
import { useGeneratorParams } from '../Generator.hooks'
import { useNavigate } from 'react-router-dom'
import { getRoutePath } from '@/routeMap'
import { ButtonWithTooltip } from '@/components/ButtonWithTooltip'

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
  const navigate = useNavigate()
  const tooltip = hasError ? 'Invalid script. Please check your rules' : ''

  const handleDeleteGenerator = async () => {
    await window.studio.ui.deleteFile(fileName)

    navigate(getRoutePath('home'))
  }

  return (
    <>
      {!!preview && (
        <>
          <ButtonWithTooltip
            variant="ghost"
            color="gray"
            disabled={hasError}
            tooltip={tooltip}
            onClick={() => {
              setIsValidatorDialogOpen(true)
            }}
          >
            <CheckCircledIcon />
            Validate script
          </ButtonWithTooltip>
          <ValidatorDialog
            script={preview}
            open={isValidatorDialogOpen}
            onOpenChange={(open) => {
              setIsValidatorDialogOpen(open)
            }}
          />
          <ExportScriptDialog
            onExport={exportScript}
            open={isExportScriptDialogOpen}
            onOpenChange={setIsExportScriptDialogOpen}
          />
        </>
      )}
      <ButtonWithTooltip
        onClick={onSave}
        disabled={!isDirty}
        tooltip={!isDirty ? 'Changes saved' : ''}
      >
        Save
      </ButtonWithTooltip>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="ghost" color="gray">
            <DotsVerticalIcon />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item
            onSelect={() => setIsExportScriptDialogOpen(true)}
            disabled={hasError}
          >
            Export script
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onSelect={handleDeleteGenerator} color="red">
            Delete generator
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </>
  )
}
