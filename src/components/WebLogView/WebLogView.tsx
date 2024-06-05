import { ProxyData } from '@/lib/types'
import { Badge, Box, Flex, Text } from '@radix-ui/themes'

export function WebLogView({ requests }: { requests: ProxyData[] }) {
  return (
    <div>
      <h2>Requests</h2>
      {requests.map((data) => (
        <Row key={data.id} data={data} />
      ))}
    </div>
  )
}

// TODO: strip params from path
function Row({ data }: { data: ProxyData }) {
  return (
    <Box pb="1">
      <Flex align="center" justify="between">
        <Text weight="bold" asChild={true}>
          <Badge mr="1" size="3" style={{}}>
            {data.request.method}
          </Badge>
        </Text>
        <Box
          flexGrow="1"
          style={{
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
        >
          {data.request.scheme}://{data.request.host}
          {data.request.path}
        </Box>
        <Box minWidth="80px" style={{ textAlign: 'right' }}>
          {data.response ? data.response.statusCode : 'loading'}
        </Box>
      </Flex>
    </Box>
  )
}
