import { DropdownMenu, Flex, IconButton, Tooltip } from '@radix-ui/themes'
import {
  CircleCheckBigIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  SaveIcon,
} from 'lucide-react'
import { useState } from 'react'

import { ButtonWithTooltip } from '@/components/ButtonWithTooltip'
import { DeleteFileDialog } from '@/components/DeleteFileDialog'
import { RunInCloudButton } from '@/components/RunInCloudDialog/RunInCloudButton'
import { RunInCloudDialog } from '@/components/RunInCloudDialog/RunInCloudDialog'
import { useDeleteFile } from '@/hooks/useDeleteFile'
import { useProxyStatus } from '@/hooks/useProxyStatus'
import { StudioFile } from '@/types'

import { useScriptExport } from '../Generator.hooks'
import { ValidatorDialog } from '../ValidatorDialog'

interface GeneratorControlsProps {
  file: StudioFile
  isDirty: boolean
  preview: string
  error: Error | undefined
  onSave: () => void
}

export function GeneratorControls({
  file,
  preview,
  error,
  isDirty,
  onSave,
}: GeneratorControlsProps) {
  const [isValidatorDialogOpen, setIsValidatorDialogOpen] = useState(false)
  const [isRunInCloudDialogOpen, setIsRunInCloudDialogOpen] = useState(false)

  const proxyStatus = useProxyStatus()
  const isScriptExportable = error === undefined && preview !== ''

  const handleExportScript = useScriptExport(file.path)

  const handleDelete = useDeleteFile({
    file,
    navigateHomeOnDelete: true,
  })

  return (
    <>
      <Flex align="center" justify="between" gap="2" ml="2">
        <Flex gap="4" align="center">
          <Tooltip content={!isDirty ? 'Changes saved' : 'Save changes'}>
            <IconButton
              onClick={onSave}
              disabled={!isDirty}
              variant="ghost"
              color="gray"
            >
              <SaveIcon />
            </IconButton>
          </Tooltip>
          <Tooltip content="Export script">
            <IconButton
              onClick={() => handleExportScript()}
              disabled={!isScriptExportable}
              variant="ghost"
              color="gray"
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Flex>
        <Flex gap="4" align="center" pl="2">
          <ButtonWithTooltip
            variant="ghost"
            tooltip={
              !isScriptExportable
                ? 'Fix script errors to enable validation'
                : proxyStatus !== 'online'
                  ? 'Start proxy to enable validation'
                  : ''
            }
            onClick={() => setIsValidatorDialogOpen(true)}
            disabled={!isScriptExportable || proxyStatus !== 'online'}
          >
            <CircleCheckBigIcon /> Validate
          </ButtonWithTooltip>
          <RunInCloudButton
            variant="solid"
            disabled={!isScriptExportable}
            onClick={() => {
              setIsRunInCloudDialogOpen(true)
            }}
          />
        </Flex>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <IconButton variant="ghost" color="gray">
              <EllipsisVerticalIcon />
            </IconButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
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
            <RunInCloudDialog
              open={isRunInCloudDialogOpen}
              script={{ type: 'raw', name: file.fileName, content: preview }}
              onOpenChange={setIsRunInCloudDialogOpen}
            />
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
