import { css } from '@emotion/react'
import {
  Button,
  DropdownMenu,
  Flex,
  IconButton,
  Tooltip,
} from '@radix-ui/themes'
import { BugIcon, EllipsisVerticalIcon } from 'lucide-react'

import { GrafanaIcon } from '@/components/icons/GrafanaIcon'
import { RichDropdownMenuItem } from '@/components/RichDropdownMenuItem'
import TextSpinner from '@/components/TextSpinner/TextSpinner'
import { useDeleteFile } from '@/hooks/useDeleteFile'
import { useProxyStatus } from '@/hooks/useProxyStatus'
import { StudioFile } from '@/types'

interface ValidatorControlsProps {
  file: StudioFile
  isRunning: boolean
  canDelete: boolean
  scenarios: string[]
  onRunScript: (scenarioName?: string) => void
  onRunInCloud: () => void
  onSelectScript: () => void
  onStopScript: () => void
}

export function ValidatorControls({
  file,
  isRunning,
  canDelete,
  scenarios,
  onRunScript,
  onRunInCloud,
  onSelectScript,
  onStopScript,
}: ValidatorControlsProps) {
  const proxyStatus = useProxyStatus()

  const deleteFile = useDeleteFile({
    file,
    navigateHomeOnDelete: true,
  })

  const handleDelete = () => {
    void deleteFile({ force: true })
  }

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
        <Flex gap="4" align="center">
          <Tooltip
            content={`Proxy is ${proxyStatus}`}
            hidden={proxyStatus === 'online'}
          >
            {scenarios.length > 1 ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger disabled={proxyStatus !== 'online'}>
                  <Button variant="ghost">
                    <BugIcon /> Debug script
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                  {scenarios.map((name) => (
                    <RichDropdownMenuItem
                      key={name}
                      label={
                        <code
                          css={css`
                            font-size: var(--font-size-1);
                          `}
                        >
                          {name}
                        </code>
                      }
                      description={`Debug the "${name}" scenario`}
                      onClick={() => onRunScript(name)}
                    />
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            ) : (
              scenarios.length === 1 && (
                <Button
                  variant="ghost"
                  disabled={proxyStatus !== 'online'}
                  onClick={() => onRunScript()}
                >
                  <BugIcon /> Debug script
                </Button>
              )
            )}
          </Tooltip>
          <Button onClick={onRunInCloud}>
            <GrafanaIcon /> Run in Grafana Cloud
          </Button>
        </Flex>
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
            <DropdownMenu.Item color="red" onClick={handleDelete}>
              Move to Trash
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </>
  )
}
