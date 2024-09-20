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
import { ValidatorDialog } from './ValidatorDialog'
import { CheckCircledIcon, DotsVerticalIcon } from '@radix-ui/react-icons'
import { useGeneratorParams } from '../Generator.hooks'
import { useNavigate } from 'react-router-dom'
import { getRoutePath } from '@/routeMap'

interface GeneratorControlsProps {
  onSave: () => void
  isDirty: boolean
}

export function GeneratorControls({ onSave, isDirty }: GeneratorControlsProps) {
  const { fileName } = useGeneratorParams()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
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
              setIsDialogOpen(true)
            }}
          >
            <CheckCircledIcon />
            Validate script
          </ButtonWithTooltip>
          <ValidatorDialog
            script={preview}
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
            }}
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
          <DropdownMenu.Item onSelect={exportScript} disabled={hasError}>
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
