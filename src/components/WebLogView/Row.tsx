import { ProxyData } from '@/types'
import { Box, Flex, Text } from '@radix-ui/themes'
import { MethodBadge } from '../MethodBadge'
import { ResponseStatusBadge } from '../ResponseStatusBadge'
import { RequestDetails } from '../RequestDetails'
import { removeQueryStringFromUrl } from './WebLogView.utils'
import { useSidebar } from '@/hooks/useSidebar'

export function Row({ data }: { data: ProxyData }) {
  const { renderInSidebar } = useSidebar()
  return (
    <Flex
      align="center"
      justify="between"
      flexGrow="1"
      my="1"
      overflow="hidden"
      mr="3"
      onClick={() => renderInSidebar(<RequestDetails data={data} />)}
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
