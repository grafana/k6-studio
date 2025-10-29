import { useDndMonitor, useDraggable } from '@dnd-kit/core'
import { css } from '@emotion/react'
import { GripVerticalIcon } from 'lucide-react'

import { Toolbar } from '@/components/primitives/Toolbar'
import { InBrowserSettings } from 'extension/src/messaging/types'

import { useInBrowserUIStore } from '../store'

interface ToolBoxRootProps {
  settings: InBrowserSettings['toolbox']
  children?: React.ReactNode
}

export function ToolBoxRoot({ settings, children }: ToolBoxRootProps) {
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

  const blockEventCapture = useInBrowserUIStore(
    (state) => state.blockEventCapture
  )

  const unblockEventCapture = useInBrowserUIStore(
    (state) => state.unblockEventCapture
  )

  const resetDragging = () => {
    // Dragging is ended on 'mouseup', so we need to wait a tick to allow
    // any 'click' events to be processed before unblocking.
    setTimeout(() => {
      unblockEventCapture()
    }, 0)
  }

  useDndMonitor({
    onDragStart() {
      // We need to block event capture while dragging the toolbox, otherwise
      // click events could be recorded if the user releases the button outside
      // of the toolbox.
      blockEventCapture()
    },
    onDragCancel: resetDragging,
    onDragEnd: resetDragging,
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
        align-items: center;

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
          align-self: stretch;
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
          padding: var(--studio-spacing-1) var(--studio-spacing-2);
          gap: 0;
        `}
      >
        {children}
      </Toolbar.Root>
    </div>
  )
}
