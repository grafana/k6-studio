import { Button, DropdownMenu, Flex, IconButton } from '@radix-ui/themes'
import { EllipsisVerticalIcon } from 'lucide-react'
import { useState } from 'react'

import { GrafanaIcon } from '@/components/icons/GrafanaIcon'
import { StudioFile } from '@/types'

import { ExportScriptDialog } from '../Generator/ExportScriptDialog'
import { DebugSession } from '../Validator/types'

interface BrowserTestEditorControlsProps {
  file: StudioFile
  session: DebugSession
  onDelete: () => void
  onExportScript: (scriptName: string) => void
  onRunInCloud: () => void
  onSave: () => void
  onStartDebugging: () => void
}

export function BrowserTestEditorControls({
  file,
  session,
  onDelete,
  onExportScript,
  onRunInCloud,
  onSave,
  onStartDebugging,
}: BrowserTestEditorControlsProps) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)

  return (
    <Flex align="center" gap="2">
      <Button variant="outline" onClick={onSave}>
        Save
      </Button>
      <Button
        variant="outline"
        onClick={onStartDebugging}
        loading={session.state === 'running'}
      >
        Debug script
      </Button>
      <Button onClick={onRunInCloud}>
        <GrafanaIcon /> Run in Grafana Cloud
      </Button>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="ghost" color="gray">
            <EllipsisVerticalIcon />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onClick={() => setIsExportDialogOpen(true)}>
            Export script
          </DropdownMenu.Item>
          <DropdownMenu.Item color="red" onClick={onDelete}>
            Delete browser test
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <ExportScriptDialog
        scriptName={`${file.displayName}.js`}
        onExport={onExportScript}
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
      />
    </Flex>
  )
}
