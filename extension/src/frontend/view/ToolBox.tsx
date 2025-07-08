import {
  DndContext,
  DragEndEvent,
  Modifier,
  MouseSensor,
  useDraggable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  restrictToHorizontalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers'
import { css } from '@emotion/react'
import {
  GripVerticalIcon,
  PanelRight,
  SquareDashedMousePointerIcon,
  SquareIcon,
  TextCursorIcon,
} from 'lucide-react'

import { Toolbar } from '@/components/primitives/Toolbar'
import { Tooltip } from '@/components/primitives/Tooltip'

import { InBrowserSettings, useToolboxSettings } from './settings'
import { Tool } from './types'

interface ToolBoxRootProps {
  settings: InBrowserSettings['toolbox']
  children?: React.ReactNode
}

function ToolBoxRoot({ settings, children }: ToolBoxRootProps) {
  const {
    isDragging,
    attributes,
    listeners,
    transform,
    setNodeRef,
    setActivatorNodeRef,
  } = useDraggable({
    id: 'toolbox',
  })

  return (
    <div
      ref={setNodeRef}
      css={css`
        position: fixed;
        top: var(--studio-spacing-2);
        transform: translateX(-50%);
        z-index: var(--studio-layer-2);

        display: flex;
        align-items: stretch;

        color: var(--studio-foreground);
        background-color: var(--studio-background);
        box-shadow: var(--studio-shadow-1);
        border: 1px solid var(--gray-6);
      `}
      style={{
        transform:
          transform !== null
            ? `translateX(calc(${transform.x}px - 50%))`
            : undefined,
        left: `${settings.position.left}vw`,
      }}
    >
      <div
        ref={setActivatorNodeRef}
        css={css`
          display: flex;
          align-items: center;
          color: var(--gray-7);
          border-right: 1px solid var(--gray-3);
        `}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon size={'1.2em'} />
      </div>
      <Toolbar.Root
        css={css`
          padding: var(--studio-spacing-1);
        `}
      >
        {children}
      </Toolbar.Root>
    </div>
  )
}

const restrictToolBoxToWindowEdges: Modifier = ({
  draggingNodeRect,
  ...rest
}) => {
  if (draggingNodeRect === null) {
    return restrictToWindowEdges({ draggingNodeRect, ...rest })
  }

  // Since we're using `transform: translateX(-50%)` to center the toolbox,
  // we need to adjust the left and right edges of the dragging node rect.
  const halfWidth = draggingNodeRect.width / 2

  return restrictToWindowEdges({
    ...rest,
    draggingNodeRect: {
      ...draggingNodeRect,
      left: draggingNodeRect.left - halfWidth,
      right: draggingNodeRect.right - halfWidth,
    },
  })
}

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
  const [settings, setSettings] = useToolboxSettings()

  const mouse = useSensor(MouseSensor)
  const sensors = useSensors(mouse)

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

  function handleDragEnd(event: DragEndEvent) {
    const newLeft =
      settings.position.left + (event.delta.x / window.innerWidth) * 100 // Convert to vw units

    setSettings({
      ...settings,
      position: {
        ...settings.position,
        left: newLeft,
      },
    })
  }

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToHorizontalAxis, restrictToolBoxToWindowEdges]}
      onDragEnd={handleDragEnd}
    >
      <ToolBoxRoot settings={settings}>
        <Tooltip delayDuration={0} asChild content="Stop recording">
          <Toolbar.Button onClick={onStopRecording}>
            <SquareIcon />
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
            content="Pick an element to add assertions to it"
          >
            <div>
              <Toolbar.ToggleItem value="inspect">
                <SquareDashedMousePointerIcon />
              </Toolbar.ToggleItem>
            </div>
          </Tooltip>
          <Tooltip
            delayDuration={0}
            asChild
            content="Add assertions on text content by selecting it"
          >
            <div>
              <Toolbar.ToggleItem value="assert-text">
                <TextCursorIcon />
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
                <PanelRight />
              </Toolbar.ToggleItem>
            </div>
          </Tooltip>
        </Toolbar.ToggleGroup>
      </ToolBoxRoot>
    </DndContext>
  )
}
