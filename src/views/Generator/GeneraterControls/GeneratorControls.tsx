import { useState } from 'react'
import { Button, ButtonProps, Tooltip } from '@radix-ui/themes'

import { useScriptPreview } from '@/hooks/useScriptPreview'
import { exportScript } from '../Generator.utils'
import { ValidatorDialog } from './ValidatorDialog'

interface GeneratorControlsProps {
  onSave: () => void
  isDirty: boolean
}

export function GeneratorControls({ onSave, isDirty }: GeneratorControlsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { preview, hasError } = useScriptPreview()
  const tooltip = hasError ? 'Invalid script. Please check your rules' : ''

  return (
    <>
      {!!preview && (
        <>
          <ButtonWithTooltip
            variant="outline"
            disabled={hasError}
            tooltip={tooltip}
            onClick={() => {
              setIsDialogOpen(true)
            }}
          >
            Validate script
          </ButtonWithTooltip>
          <ButtonWithTooltip
            variant="outline"
            disabled={hasError}
            tooltip={tooltip}
            onClick={exportScript}
          >
            Export script
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
