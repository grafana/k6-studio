import { Flex } from '@radix-ui/themes'
import { Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <Flex
      direction="column"
      overflow="hidden"
      maxWidth="100%"
      height="100dvh"
      p="2"
    >
      <Outlet />
    </Flex>
  )
}
