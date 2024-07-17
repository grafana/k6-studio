import { ReactNode } from 'react'
import { Box, Flex, Heading, Text } from '@radix-ui/themes'
import { Allotment } from 'allotment'

import { ProxyData } from '@/types'
import { useDrawer } from '@/hooks/useDrawer'

import { MethodBadge } from '../MethodBadge'
import { ResponseStatusBadge } from '../ResponseStatusBadge'
import { RequestDetails } from './RequestDetails'
import { ResponseDetails } from './ResponseDetails'
import { removeQueryStringFromUrl } from './WebLogView.utils'

export function Row({ data }: { data: ProxyData }) {
  const { renderInSidebar } = useDrawer('right')

  return (
    <Flex
      align="center"
      justify="between"
      flexGrow="1"
      my="1"
      overflow="hidden"
      mr="3"
      onClick={() => renderInSidebar(<SideBar data={data} />)}
      style={{ cursor: 'var(--cursor-button)' }}
    >
      <Flex width="80px" asChild justify="center">
        <MethodBadge method={data.request.method} />
      </Flex>
      <Box flexGrow="1" asChild>
        <Text truncate>
          {data.request.host}
          {removeQueryStringFromUrl(data.request.path)}
        </Text>
      </Box>
      <Flex minWidth="40px" justify="end" asChild>
        <ResponseStatusBadge status={data.response?.statusCode} />
      </Flex>
    </Flex>
  )
}

function SideBar({ data }: { data: ProxyData }) {
  return (
    <Allotment defaultSizes={[1, 1]} vertical>
      <Allotment.Pane minSize={200}>
        <SideBarContent heading="Request">
          <RequestDetails data={data} />
        </SideBarContent>
      </Allotment.Pane>
      <Allotment.Pane minSize={200}>
        <SideBarContent heading="Response">
          <ResponseDetails data={data} />
        </SideBarContent>
      </Allotment.Pane>
    </Allotment>
  )
}

interface SideBarContentProps {
  children: ReactNode
  heading: string
}

function SideBarContent({ children, heading }: SideBarContentProps) {
  return (
    <Flex direction="column" height="100%">
      <Box
        p="2"
        style={{ backgroundColor: 'var(--accent-3)', flex: '1 0 auto' }}
      >
        <Heading size="2">{heading}</Heading>
      </Box>
      {children}
    </Flex>
  )
}
