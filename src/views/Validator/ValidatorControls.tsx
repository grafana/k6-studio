import { Button, DropdownMenu, IconButton, Tooltip } from '@radix-ui/themes'
import { EllipsisVerticalIcon } from 'lucide-react'

import { DeleteFileDialog } from '@/components/DeleteFileDialog'
import TextSpinner from '@/components/TextSpinner/TextSpinner'
import { GrafanaIcon } from '@/components/icons/GrafanaIcon'
import { useProxyStatus } from '@/hooks/useProxyStatus'
import { StudioFile } from '@/types'

interface ValidatorControlsProps {
  file: StudioFile
  isRunning: boolean
  canDelete: boolean
  onRunScript: () => void
  onRunInCloud: () => void
  onSelectScript: () => void
  onStopScript: () => void
  onAfterDelete: () => void
}

export function ValidatorControls({
  file,
  isRunning,
  canDelete,
  onRunScript,
  onRunInCloud,
  onSelectScript,
  onStopScript,
  onAfterDelete,
}: ValidatorControlsProps) {
  const proxyStatus = useProxyStatus()

  return (
    <>
      {isRunning && (
        <>
          <TextSpinner text="Running" />
          <Button variant="outline" onClick={onStopScript}>
            Stop run
          </Button>
        </>
      )}
      {!isRunning && (
        <>
          <Button variant="outline" onClick={onRunInCloud}>
            <GrafanaIcon /> Run in Grafana Cloud
          </Button>
          <Tooltip
            content={`Proxy is ${proxyStatus}`}
            hidden={proxyStatus === 'online'}
          >
            <Button disabled={proxyStatus !== 'online'} onClick={onRunScript}>
              Validate script
            </Button>
          </Tooltip>
        </>
      )}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger disabled={isRunning}>
          <IconButton variant="ghost" color="gray" aria-label="Actions">
            <EllipsisVerticalIcon />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <Tooltip
            content="Validate a k6 script created outside of Grafana k6 Studio"
            side="left"
          >
            <DropdownMenu.Item onClick={onSelectScript}>
              Open external script
            </DropdownMenu.Item>
          </Tooltip>
          {canDelete && (
            <DeleteFileDialog
              file={file}
              onDeleted={onAfterDelete}
              trigger={
                <DropdownMenu.Item color="red">Delete</DropdownMenu.Item>
              }
            />
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </>
  )
}
