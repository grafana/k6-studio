import { ProxyData } from '@/types'
import { Flex, Text } from '@radix-ui/themes'
import { parseContent } from './RequestDetails.utils'

export function Response({ data }: { data: ProxyData }) {
  const content = parseContent(data)

  if (!content) {
    return (
      <Flex height="200px" justify="center" align="center">
        Response preview not available
      </Flex>
    )
  }

  return (
    <Text size="1" wrap="pretty">
      <pre>
        <code>{content}</code>
      </pre>
    </Text>
  )
}
