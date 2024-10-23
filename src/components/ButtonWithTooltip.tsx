import { Button, ButtonProps, Tooltip } from '@radix-ui/themes'
import { forwardRef } from 'react'

export const ButtonWithTooltip = forwardRef<
  HTMLButtonElement,
  ButtonProps & { tooltip: string }
>(function ButtonWithTooltip({ tooltip, ...props }, ref) {
  return (
    <Tooltip content={tooltip} hidden={!tooltip}>
      <Button {...props} ref={ref} />
    </Tooltip>
  )
})
