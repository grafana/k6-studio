import { css } from '@emotion/react'
import { IconButton, IconButtonProps } from '@radix-ui/themes'
import { GripVerticalIcon } from 'lucide-react'

export function EditableActionDragHandle({
  overlay,
  ...props
}: IconButtonProps & { overlay?: true }) {
  return (
    <IconButton
      size="2"
      variant="ghost"
      color="gray"
      aria-label={overlay ? 'Drag to reorder' : undefined}
      data-overlay={overlay}
      css={css`
        cursor: grab;

        &[data-overlay='true'] {
          cursor: grabbing;
        }
      `}
      {...props}
    >
      <GripVerticalIcon color="gray" aria-hidden />
    </IconButton>
  )
}
