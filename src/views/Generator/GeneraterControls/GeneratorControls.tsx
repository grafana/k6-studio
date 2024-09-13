import { Button, ButtonProps, Tooltip } from '@radix-ui/themes'
import { RecordingSelector } from '../RecordingSelector'
import { Allowlist } from '../Allowlist'
import { useScriptPreview } from '@/hooks/useScriptPreview'
import { exportScript } from '../Generator.utils'
import { ValidatorDialog } from './ValidatorDialog'
import { useState } from 'react'

interface GeneratorControlsProps {
  onSave: () => void
  isDirty: boolean
}

export function GeneratorControls({ onSave, isDirty }: GeneratorControlsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { preview, error } = useScriptPreview()
  const tooltip = error ? 'Invalid script. Please check your rules' : ''

  return (
    <>
      <RecordingSelector />
      <Allowlist />

      {!!preview && (
        <>
          <ButtonWithTooltip
            variant="outline"
            disabled={error}
            tooltip={tooltip}
            onClick={() => {
              setIsDialogOpen(true)
            }}
          >
            Validate script
          </ButtonWithTooltip>
          <ButtonWithTooltip
            variant="outline"
            disabled={error}
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
