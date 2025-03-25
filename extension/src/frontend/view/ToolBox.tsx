import { css } from '@emotion/react'
import {
  CursorArrowIcon,
  CursorTextIcon,
  ReaderIcon,
} from '@radix-ui/react-icons'

import { Toolbar } from '@/components/primitives/Toolbar'

import { Tool } from './types'

interface ToolBoxProps {
  tool: Tool | null
  isDrawerOpen: boolean
  onSelectTool: (value: Tool | null) => void
  onToggleDrawer: (open: boolean) => void
}

export function ToolBox({
  isDrawerOpen,
  tool,
  onSelectTool,
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
        left: 50%;
        transform: translateX(-50%);
        z-index: var(--studio-layer-2);
        color: var(--studio-foreground);
        background-color: var(--studio-background);
        box-shadow: var(--studio-shadow-1);
      `}
    >
      <Toolbar.ToggleGroup
        type="single"
        value={tool ?? ''}
        onValueChange={handleToolChange}
      >
        <Toolbar.ToggleItem value="inspect">
          <CursorArrowIcon />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem value="assert-text">
          <CursorTextIcon />
        </Toolbar.ToggleItem>
      </Toolbar.ToggleGroup>
      <Toolbar.Separator />
      <Toolbar.ToggleGroup
        type="single"
        value={isDrawerOpen ? 'events' : ''}
        onValueChange={handleDrawerToggle}
      >
        <Toolbar.ToggleItem value="events">
          <ReaderIcon />
        </Toolbar.ToggleItem>
      </Toolbar.ToggleGroup>
    </Toolbar.Root>
  )
}
