import { Cross2Icon } from '@radix-ui/react-icons'
import { Box, IconButton } from '@radix-ui/themes'
import { ReactNode } from 'react'

export function Drawer({
  children,
  close,
}: {
  children: ReactNode
  close: () => void
}) {
  return (
    <>
      <Box p="2" position="absolute" right="0" top="0">
        <IconButton size="1" variant="ghost" onClick={close}>
          <Cross2Icon />
        </IconButton>
      </Box>
      <Box height="100%">{children}</Box>
    </>
  )
}
