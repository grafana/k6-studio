import { DropdownMenu, Flex, IconButton } from '@radix-ui/themes'
import { EllipsisVerticalIcon } from 'lucide-react'
import { useState } from 'react'

import { ButtonWithTooltip } from '@/components/ButtonWithTooltip'
import { DeleteFileDialog } from '@/components/DeleteFileDialog'
import { useDeleteFile } from '@/hooks/useDeleteFile'
import { useProxyStatus } from '@/hooks/useProxyStatus'
import { StudioFile } from '@/types'

import { useScriptExport } from '../Generator.hooks'
import { RecordingSelector } from '../RecordingSelector'
import { ValidatorDialog } from '../ValidatorDialog'

interface GeneratorControlsProps {
  file: StudioFile
  isDirty: boolean
  preview: string
  error: Error | undefined
  onSave: () => void
  onChangeRecording: () => void
}

export function GeneratorControls({
  file,
  preview,
  error,
  isDirty,
  onSave,
  onChangeRecording,
}: GeneratorControlsProps) {
  const [isValidatorDialogOpen, setIsValidatorDialogOpen] = useState(false)
  const proxyStatus = useProxyStatus()
  const isScriptExportable = error === undefined && preview !== ''

  const handleExportScript = useScriptExport(file.path)

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
              disabled={!isScriptExportable || proxyStatus !== 'online'}
              onSelect={() => setIsValidatorDialogOpen(true)}
            >
              Validate script
            </DropdownMenu.Item>
            <DropdownMenu.Item
              disabled={!isScriptExportable}
              onSelect={() => void handleExportScript()}
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
          </>
        )}
      </Flex>
    </>
  )
}
