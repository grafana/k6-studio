import { Box, Flex } from '@radix-ui/themes'
import { PropsWithChildren, ReactNode } from 'react'

import { ViewHeading } from './ViewHeading'

interface ViewProps {
  title: string
  subTitle?: ReactNode
  actions: ReactNode
  loading?: boolean
}

export function View({
  title,
  subTitle,
  actions,
  loading = false,
  children,
}: PropsWithChildren<ViewProps>) {
  return (
    <Flex direction="column" overflow="hidden" width="100%" height="100%">
      <ViewHeading title={title} subTitle={subTitle}>
        {actions}
      </ViewHeading>
      {loading ? <Box p="2">Loading...</Box> : children}
    </Flex>
  )
}
