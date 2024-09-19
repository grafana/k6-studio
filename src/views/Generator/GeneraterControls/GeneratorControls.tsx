import { Button, ButtonProps, Tooltip } from '@radix-ui/themes'
import { RecordingSelector } from '../RecordingSelector'
import { Allowlist } from '../Allowlist'
import { useScriptPreview } from '@/hooks/useScriptPreview'
import { exportScript } from '../Generator.utils'
import { ValidatorDialog } from './ValidatorDialog'
import { useState } from 'react'
import { ExportScriptDialog } from '../ExportScriptDialog'

interface GeneratorControlsProps {
  onSave: () => void
  isDirty: boolean
}

export function GeneratorControls({ onSave, isDirty }: GeneratorControlsProps) {
  const [isValidatorDialogOpen, setIsValidatorDialogOpen] = useState(false)
  const [isExportScriptDialogOpen, setIsExportScriptDialogOpen] =
    useState(false)
  const { preview, hasError } = useScriptPreview()
  const tooltip = hasError ? 'Invalid script. Please check your rules' : ''

  return (
    <>
      <RecordingSelector />
      <Allowlist />

      {!!preview && (
        <>
          <ButtonWithTooltip
            variant="outline"
            disabled={hasError}
            tooltip={tooltip}
            onClick={() => {
              setIsValidatorDialogOpen(true)
            }}
          >
            Validate script
          </ButtonWithTooltip>
          <ButtonWithTooltip
            variant="outline"
            disabled={hasError}
            tooltip={tooltip}
            onClick={() => setIsExportScriptDialogOpen(true)}
          >
            Export script
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
