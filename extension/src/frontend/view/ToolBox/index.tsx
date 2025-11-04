import {
  DndContext,
  DragEndEvent,
  Modifier,
  MouseSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  restrictToHorizontalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers'
import { css } from '@emotion/react'
import {
  PanelRight,
  RotateCcwIcon,
  SquareDashedMousePointerIcon,
  SquareStopIcon,
  TextCursorIcon,
} from 'lucide-react'

import { Flex } from '@/components/primitives/Flex'
import { Toolbar } from '@/components/primitives/Toolbar'

import { useStudioClient } from '../StudioClientProvider'
import { Tool } from '../types'

import { ToolBoxLogo } from './ToolBoxLogo'
import { ToolBoxRoot } from './ToolBoxRoot'
import { useToolboxSettings } from './ToolBoxRoot.hooks'
import { ToolBoxTooltip } from './ToolBoxTooltip'

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

  const client = useStudioClient()

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
        <ToolBoxLogo />
        <Toolbar.Separator />
        <Flex
          css={css`
            color: var(--red-11);
            font-size: var(--studio-font-size-2);
            font-weight: 500;
          `}
          align="center"
          gap="1"
        >
          <ToolBoxTooltip content="Stop recording">
            <Toolbar.Button onClick={onStopRecording}>
              <SquareStopIcon
                css={css`
                  color: var(--red-11);
                `}
              />
            </Toolbar.Button>
          </ToolBoxTooltip>
          <span>Recording</span>
        </Flex>

        <Toolbar.Separator />
        <Toolbar.ToggleGroup
          type="single"
          value={tool ?? ''}
          onValueChange={handleToolChange}
        >
          <ToolBoxTooltip content="Pick an element to add assertions to it">
            <Toolbar.ToggleItem value="inspect">
              <SquareDashedMousePointerIcon />
            </Toolbar.ToggleItem>
          </ToolBoxTooltip>
          <ToolBoxTooltip content="Add assertions on text content by selecting it">
            <Toolbar.ToggleItem value="assert-text">
              <TextCursorIcon />
            </Toolbar.ToggleItem>
          </ToolBoxTooltip>
        </Toolbar.ToggleGroup>
        <Toolbar.Separator />
        <Toolbar.ToggleGroup
          type="single"
          value={isDrawerOpen ? 'events' : ''}
          onValueChange={handleDrawerToggle}
        >
          <ToolBoxTooltip content="Toggle event list">
            <Toolbar.ToggleItem value="events">
              <PanelRight />
            </Toolbar.ToggleItem>
          </ToolBoxTooltip>
        </Toolbar.ToggleGroup>
        {
          // @ts-expect-error we have commonjs set as module option
          import.meta.env.DEV && (
            <>
              <Toolbar.Separator />
              <ToolBoxTooltip content="Reload extension (dev only)">
                <Toolbar.Button
                  onClick={() => {
                    client.send({
                      type: 'reload-extension',
                    })

                    setTimeout(() => {
                      window.location.reload()
                    }, 500)
                  }}
                >
                  <RotateCcwIcon
                    css={css`
                      stroke-width: 2px !important;
                      color: var(--red-10);
                    `}
                  />
                </Toolbar.Button>
              </ToolBoxTooltip>
            </>
          )
        }
      </ToolBoxRoot>
    </DndContext>
  )
}
