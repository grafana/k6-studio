import { useDraggable } from '@dnd-kit/core'
import { css } from '@emotion/react'
import { GripVerticalIcon } from 'lucide-react'

import { Toolbar } from '@/components/primitives/Toolbar'

import { InBrowserSettings } from '../settings'

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
