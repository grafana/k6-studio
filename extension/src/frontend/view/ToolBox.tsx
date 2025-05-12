import { css } from '@emotion/react'
import {
  CursorArrowIcon,
  CursorTextIcon,
  ReaderIcon,
  StopIcon,
} from '@radix-ui/react-icons'

import { Toolbar } from '@/components/primitives/Toolbar'
import { Tooltip } from '@/components/primitives/Tooltip'

import { Tool } from './types'

interface ToolBoxProps {
  tool: Tool | null
  isDrawerOpen: boolean
  onSelectTool: (value: Tool | null) => void
  onStopRecording: () => void
  onToggleDrawer: (open: boolean) => void
}

export function ToolBox({
  isDrawerOpen,
  tool,
  onSelectTool,
  onStopRecording,
  onToggleDrawer,
}: ToolBoxProps) {
  const handleToolChange = (value: string) => {
    switch (value) {
      case 'assert-text':
      case 'inspect':
        onSelectTool(value)
        break

      default:
        onSelectTool(null)
        break
    }
  }

  const handleDrawerToggle = (values: string) => {
    onToggleDrawer(values === 'events')
  }

  return (
    <Toolbar.Root
      css={css`
        position: fixed;
        top: var(--studio-spacing-2);
        left: calc(50% - var(--removed-body-scroll-bar-size, 0px) / 2);
        transform: translateX(-50%);
        z-index: var(--studio-layer-2);
        color: var(--studio-foreground);
        background-color: var(--studio-background);
        box-shadow: var(--studio-shadow-1);
        border: 1px solid var(--gray-6);
        padding: var(--studio-spacing-1);
      `}
    >
      <Tooltip delayDuration={0} asChild content="Stop recording">
        <Toolbar.Button onClick={onStopRecording}>
          <StopIcon />
        </Toolbar.Button>
      </Tooltip>
      <Toolbar.Separator />
      <Toolbar.ToggleGroup
        type="single"
        value={tool ?? ''}
        onValueChange={handleToolChange}
      >
        <Tooltip
          delayDuration={0}
          asChild
          content="Pick an element to add assertions to it."
        >
          <div>
            <Toolbar.ToggleItem value="inspect">
              <CursorArrowIcon />
            </Toolbar.ToggleItem>
          </div>
        </Tooltip>
        <Tooltip
          delayDuration={0}
          asChild
          content="Add assertions on text content by selecting it."
        >
          <div>
            <Toolbar.ToggleItem value="assert-text">
              <CursorTextIcon />
            </Toolbar.ToggleItem>
          </div>
        </Tooltip>
      </Toolbar.ToggleGroup>
      <Toolbar.Separator />
      <Toolbar.ToggleGroup
        type="single"
        value={isDrawerOpen ? 'events' : ''}
        onValueChange={handleDrawerToggle}
      >
        <Tooltip delayDuration={0} asChild content="Toggle event list">
          <div>
            <Toolbar.ToggleItem value="events">
              <ReaderIcon />
            </Toolbar.ToggleItem>
          </div>
        </Tooltip>
      </Toolbar.ToggleGroup>
    </Toolbar.Root>
  )
}
