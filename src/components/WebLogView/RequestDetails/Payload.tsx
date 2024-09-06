import { Flex } from '@radix-ui/themes'

import { ProxyData } from '@/types'

import { ReadOnlyEditor } from '../../Monaco/ReadOnlyEditor'
import { parseParams } from './utils'
import { getContentType } from '@/utils/headers'
import { FormPayloadPreview } from './FormPayloadPreview'

export function Payload({ data }: { data: ProxyData }) {
  const content = parseParams(data)
  const contentType = getContentType(data.request?.headers ?? [])

  if (!content) {
    return (
      <Flex height="100%" justify="center" align="center">
        No Payload
      </Flex>
    )
  }

  if (contentType === 'application/x-www-form-urlencoded') {
    return <FormPayloadPreview payloadJsonString={content} />
  }

  return <ReadOnlyEditor language="javascript" value={content} />
}
