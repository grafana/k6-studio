import { DropdownMenu, IconButton, Tooltip } from '@radix-ui/themes'
import { MonitorIcon, PlusIcon, ServerCogIcon, VideoIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { RichDropdownMenuItem } from '@/components/RichDropdownMenuItem'
import { useCreateTestActions } from '@/hooks/useCreateTestActions'
import { getRoutePath } from '@/routeMap'

export function CreateNewPopover() {
  const navigate = useNavigate()
  const {
    handleCreateHTTPTest,
    handleCreateBrowserTest,
    isBrowserEditorEnabled,
  } = useCreateTestActions()

  return (
    <DropdownMenu.Root>
      <Tooltip content="Create new" side="right">
        <DropdownMenu.Trigger>
          <IconButton aria-label="Create new" variant="soft" size="3">
            <PlusIcon style={{ width: 20, height: 20, strokeWidth: 2 }} />
          </IconButton>
        </DropdownMenu.Trigger>
      </Tooltip>
      <DropdownMenu.Content size="1">
        <RichDropdownMenuItem
          label="Recording"
          icon={<VideoIcon />}
          description="Capture HTTP traffic and browser events"
          onClick={() => navigate(getRoutePath('recorder'))}
        />
        <RichDropdownMenuItem
          label="HTTP test"
          icon={<ServerCogIcon />}
          description="Create a test from HTTP requests using rules"
          onClick={() => handleCreateHTTPTest()}
        />
        {isBrowserEditorEnabled && (
          <RichDropdownMenuItem
            label="Browser test"
            icon={<MonitorIcon />}
            description="Create a test simulating browser interactions"
            onClick={() => handleCreateBrowserTest()}
          />
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
