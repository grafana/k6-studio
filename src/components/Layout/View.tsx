import { Box, Flex } from '@radix-ui/themes'
import { PropsWithChildren, ReactNode } from 'react'
import { PageHeading } from './PageHeading'

interface ViewProps {
  title: string
  actions: ReactNode
  loading?: boolean
}

export function View({
  title,
  actions,
  loading = false,
  children,
}: PropsWithChildren<ViewProps>) {
  return (
    <Flex direction="column" overflow="hidden" width="100%" height="100%">
      <PageHeading text={title}>{actions}</PageHeading>
      {loading ? <Box p="2">Loading...</Box> : children}
    </Flex>
  )
}