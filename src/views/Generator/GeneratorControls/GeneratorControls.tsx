import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { DropdownMenu, Flex, IconButton } from '@radix-ui/themes'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ButtonWithTooltip } from '@/components/ButtonWithTooltip'
import { useProxyStatus } from '@/hooks/useProxyStatus'
import { useScriptPreview } from '@/hooks/useScriptPreview'
import { getRoutePath } from '@/routeMap'
import { getFileNameWithoutExtension } from '@/utils/file'

import { ExportScriptDialog } from '../ExportScriptDialog'
import { useGeneratorParams } from '../Generator.hooks'
import { exportScript } from '../Generator.utils'
import { RecordingSelector } from '../RecordingSelector'
import { ValidatorDialog } from '../ValidatorDialog'

interface GeneratorControlsProps {
  onSave: () => void
  isDirty: boolean
  onChangeRecording: () => void
}

export function GeneratorControls({
  onSave,
  isDirty,
  onChangeRecording,
}: GeneratorControlsProps) {
  const [isValidatorDialogOpen, setIsValidatorDialogOpen] = useState(false)
  const [isExportScriptDialogOpen, setIsExportScriptDialogOpen] =
    useState(false)
  const { fileName } = useGeneratorParams()
  const { preview, hasError } = useScriptPreview()
  const proxyStatus = useProxyStatus()
  const isScriptExportable = !hasError && !!preview
  const navigate = useNavigate()

  const handleDeleteGenerator = async () => {
    await window.studio.ui.deleteFile({
      type: 'generator',
      fileName,
      displayName: getFileNameWithoutExtension(fileName),
    })

    navigate(getRoutePath('home'))
  }

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
              <DotsVerticalIcon />
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
      </Flex>
    </>
  )
}
