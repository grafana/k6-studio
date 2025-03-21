import { css } from '@emotion/react'
import { CursorArrowIcon, InfoCircledIcon } from '@radix-ui/react-icons'
import { Tool } from './types'
import { Toolbar } from '@/components/primitives/Toolbar'

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
      case 'inspect':
        onSelectTool('inspect')
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
        background-color: white;
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
      </Toolbar.ToggleGroup>
      <Toolbar.Separator />
      <Toolbar.ToggleGroup
        type="single"
        value={isDrawerOpen ? 'events' : ''}
        onValueChange={handleDrawerToggle}
      >
        <Toolbar.ToggleItem value="events">
          <InfoCircledIcon />
        </Toolbar.ToggleItem>
      </Toolbar.ToggleGroup>
    </Toolbar.Root>
  )
}
