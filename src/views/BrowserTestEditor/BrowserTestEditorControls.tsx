import {
  Button,
  DropdownMenu,
  Flex,
  IconButton,
  Spinner,
  Tooltip,
} from '@radix-ui/themes'
import {
  CircleCheckBigIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  SaveIcon,
} from 'lucide-react'
import { useState } from 'react'

import { GrafanaIcon } from '@/components/icons/GrafanaIcon'
import { RunInCloudDialog } from '@/components/RunInCloudDialog/RunInCloudDialog'
import { useDeleteFile } from '@/hooks/useDeleteFile'
import { useExportScript } from '@/hooks/useExportScript'
import { StudioFile } from '@/types'

import { DebugSession } from '../Validator/types'

interface BrowserTestEditorControlsProps {
  file: StudioFile
  preview: string
  session: DebugSession
  isDirty: boolean
  onStartDebugging: () => void
  onStopDebugging: () => void
  onSave: () => void
}

export function BrowserTestEditorControls({
  file,
  preview,
  session,
  isDirty,
  onStartDebugging,
  onStopDebugging,
  onSave,
}: BrowserTestEditorControlsProps) {
  const [isRunInCloudDialogOpen, setIsRunInCloudDialogOpen] = useState(false)

  const handleDelete = useDeleteFile({
    file,
    navigateHomeOnDelete: true,
  })

  const exportScript = useExportScript({
    fileName: file.displayName,
    content: () => preview,
  })

  const handleExportScript = () => {
    void exportScript()
  }

  return (
    <Flex align="center" gap="2" ml="2">
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
          <IconButton onClick={handleExportScript} variant="ghost" color="gray">
            <DownloadIcon />
          </IconButton>
        </Tooltip>
      </Flex>
      <Flex gap="4" align="center" pl="2">
        {session.state === 'running' && (
          <Button variant="ghost" onClick={onStopDebugging}>
            <Spinner />
            Stop
          </Button>
        )}
        {session.state !== 'running' && (
          <Button variant="ghost" onClick={onStartDebugging}>
            <CircleCheckBigIcon /> Validate
          </Button>
        )}
        <Button onClick={() => setIsRunInCloudDialogOpen(true)}>
          <GrafanaIcon /> Run in Grafana Cloud
        </Button>
      </Flex>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="ghost" color="gray">
            <EllipsisVerticalIcon />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item color="red" onClick={handleDelete}>
            Move to Trash
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <RunInCloudDialog
        open={isRunInCloudDialogOpen}
        script={{
          type: 'raw',
          name: file.fileName,
          content: preview,
        }}
        onOpenChange={setIsRunInCloudDialogOpen}
      />
    </Flex>
  )
}
