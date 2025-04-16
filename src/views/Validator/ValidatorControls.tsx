import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { Button, DropdownMenu, IconButton, Tooltip } from '@radix-ui/themes'

import TextSpinner from '@/components/TextSpinner/TextSpinner'
import { GrafanaIcon } from '@/components/icons/GrafanaIcon'
import { useProxyStatus } from '@/hooks/useProxyStatus'

interface ValidatorControlsProps {
  isRunning: boolean
  isScriptSelected: boolean
  isExternal: boolean
  onDeleteScript: () => void
  onRunScript: () => void
  onRunInCloud: () => void
  onSelectScript: () => void
  onStopScript: () => void
}

export function ValidatorControls({
  isRunning,
  isScriptSelected,
  isExternal,
  onDeleteScript,
  onRunScript,
  onRunInCloud,
  onSelectScript,
  onStopScript,
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
            <Button
              disabled={!isScriptSelected || proxyStatus !== 'online'}
              onClick={onRunScript}
            >
              Validate script
            </Button>
          </Tooltip>
        </>
      )}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger disabled={isRunning}>
          <IconButton variant="ghost" color="gray" aria-label="Actions">
            <DotsVerticalIcon />
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
          {isScriptSelected && !isExternal && (
            <DropdownMenu.Item color="red" onClick={onDeleteScript}>
              Delete
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </>
  )
}
