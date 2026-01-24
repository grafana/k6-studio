import { DropdownMenu, Flex, IconButton } from '@radix-ui/themes'
import { EllipsisVerticalIcon } from 'lucide-react'
import { useState } from 'react'

import { ButtonWithTooltip } from '@/components/ButtonWithTooltip'
import { DeleteFileDialog } from '@/components/DeleteFileDialog'
import { useDeleteFile } from '@/hooks/useDeleteFile'
import { useProxyStatus } from '@/hooks/useProxyStatus'
import { useScriptPreview } from '@/hooks/useScriptPreview'
import { useGeneratorStore } from '@/store/generator'
import { StudioFile } from '@/types'

import { ExportScriptDialog } from '../ExportScriptDialog'
import { useScriptExport } from '../Generator.hooks'
import { RecordingSelector } from '../RecordingSelector'
import { ValidatorDialog } from '../ValidatorDialog'

interface GeneratorControlsProps {
  file: StudioFile
  isDirty: boolean
  onSave: () => void
  onChangeRecording: () => void
}

export function GeneratorControls({
  file,
  isDirty,
  onSave,
  onChangeRecording,
}: GeneratorControlsProps) {
  const scriptName = useGeneratorStore((store) => store.scriptName)

  const [isValidatorDialogOpen, setIsValidatorDialogOpen] = useState(false)
  const [isExportScriptDialogOpen, setIsExportScriptDialogOpen] =
    useState(false)
  const { preview, hasError } = useScriptPreview()
  const proxyStatus = useProxyStatus()
  const isScriptExportable = !hasError && !!preview

  const handleExportScript = useScriptExport(file)

  const handleDelete = useDeleteFile({
    file,
    navigateHomeOnDelete: true,
  })

  return (
    <>
      <RecordingSelector onChangeRecording={onChangeRecording} />
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
              <EllipsisVerticalIcon />
            </IconButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item
              onSelect={() => setIsValidatorDialogOpen(true)}
              disabled={!isScriptExportable || proxyStatus !== 'online'}
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
            <DeleteFileDialog
              file={file}
              onConfirm={handleDelete}
              trigger={
                <DropdownMenu.Item
                  color="red"
                  onClick={(e) => e.preventDefault()}
                >
                  Delete generator
                </DropdownMenu.Item>
              }
            />
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
