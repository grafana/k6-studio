import { Button, ButtonProps, Tooltip } from '@radix-ui/themes'
import { RecordingSelector } from '../RecordingSelector'
import { Allowlist } from '../Allowlist'
import { useScriptPreview } from '@/hooks/useScriptPreview'
import { exportScript } from '../Generator.utils'
import { ValidatorDialog } from './ValidatorDialog'
import { useState } from 'react'

interface GeneratorControlsProps {
  onSave: () => void
}

export function GeneratorControls({ onSave }: GeneratorControlsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { preview, error } = useScriptPreview()
  const tooltip = error ? 'Invalid script. Please check your rules' : ''

  return (
    <>
      <RecordingSelector />
      <Allowlist />
      <Button onClick={onSave}>Save</Button>

      {!!preview && (
        <>
          <Tooltip
            content={
              error ? 'Invalid script. Please check your rules' : undefined
            }
          >
            <ButtonWithTooltip
              disabled={error}
              tooltip={tooltip}
              onClick={() => {
                setIsDialogOpen(true)
              }}
            >
              Run script
            </ButtonWithTooltip>
          </Tooltip>
          <ButtonWithTooltip
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
    </>
  )
}

function ButtonWithTooltip({
  tooltip,
  ...props
}: ButtonProps & { tooltip: string }) {
  if (!tooltip) {
    return <Button {...props} />
  }

  return (
    <Tooltip content={tooltip}>
      <Button {...props} />
    </Tooltip>
  )
}
