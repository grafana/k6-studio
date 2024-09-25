import { Flex } from '@radix-ui/themes'

import { ProxyData } from '@/types'

import { ReadOnlyEditor } from '../../Monaco/ReadOnlyEditor'
import { parseParams } from './utils'
import { getContentType } from '@/utils/headers'
import { FormPayloadPreview } from './FormPayloadPreview'
import { Raw } from '../ResponseDetails/Raw'

export function Payload({ data }: { data: ProxyData }) {
  const content = parseParams(data)
  const contentType = getContentType(data.request?.headers ?? [])

  if (!content) {
    return (
      <Flex height="200px" justify="center" align="center">
        No payload
      </Flex>
    )
  }

  if (contentType === 'multipart/form-data') {
    return <Raw content={content} format="text" />
  }

  if (contentType === 'application/x-www-form-urlencoded') {
    return <FormPayloadPreview payloadJsonString={content} />
  }

  return <ReadOnlyEditor language="javascript" value={content} />
}
