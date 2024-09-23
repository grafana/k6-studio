import { useState } from 'react'
import {
  Button,
  ButtonProps,
  DropdownMenu,
  IconButton,
  Tooltip,
} from '@radix-ui/themes'

import { useScriptPreview } from '@/hooks/useScriptPreview'
import { exportScript } from '../Generator.utils'
import { ValidatorDialog } from '../ValidatorDialog'
import { ExportScriptDialog } from '../ExportScriptDialog'
import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { useGeneratorParams } from '../Generator.hooks'
import { useNavigate } from 'react-router-dom'
import { getRoutePath } from '@/routeMap'

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

  const handleDeleteGenerator = async () => {
    await window.studio.ui.deleteFile(fileName)

    navigate(getRoutePath('home'))
  }

  return (
    <>
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
            onExport={exportScript}
            open={isExportScriptDialogOpen}
            onOpenChange={setIsExportScriptDialogOpen}
          />
        </>
      )}
    </>
  )
}

function ButtonWithTooltip({
  tooltip,
  ...props
}: ButtonProps & { tooltip: string }) {
  return (
    <Tooltip content={tooltip} hidden={!tooltip}>
      <Button {...props} />
    </Tooltip>
  )
}
