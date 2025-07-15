import { useDndContext } from '@dnd-kit/core'

import { Tooltip, TooltipProps } from '@/components/primitives/Tooltip'

export function ToolBoxTooltip({
  children,
  ...props
}: Omit<TooltipProps, 'delayDuration' | 'asChild'>) {
  const context = useDndContext()

  return (
    <Tooltip {...props} delayDuration={0} asChild>
      <div
        style={{
          // If you drag the toolbox too fast, the mouse cursor might hover a
          // button. This prevents tooltip and hover effects from being shown
          // while the toolbox is being dragged.
          pointerEvents: context.active !== null ? 'none' : undefined,
        }}
      >
        {children}
      </div>
    </Tooltip>
  )
}
