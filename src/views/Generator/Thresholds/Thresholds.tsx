import { BarChartIcon } from '@radix-ui/react-icons'
import { Button } from '@radix-ui/themes'
import { useState } from 'react'
import { ThresholdsDialog } from './ThresholdsDialog'

export function Thresholds() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="1"
        color="gray"
        onClick={() => setOpen(true)}
      >
        <BarChartIcon />
        Thresholds
      </Button>

      <ThresholdsDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
