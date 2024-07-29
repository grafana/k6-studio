import { Flex } from '@radix-ui/themes'

import { ProxyData } from '@/types'

import { ReadOnlyEditor } from '../../Monaco/ReadOnlyEditor'
import { parseParams } from './utils'

export function Payload({ data }: { data: ProxyData }) {
  const content = parseParams(data)

  if (!content) {
    return (
      <Flex height="200px" justify="center" align="center">
        Payload not available
      </Flex>
    )
  }

  return <ReadOnlyEditor language="javascript" value={content} />
}
