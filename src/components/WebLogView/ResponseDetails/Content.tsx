import { Flex } from '@radix-ui/themes'

import { ProxyData } from '@/types'
import { getContentType } from '@/utils/headers'

import { ContentPreview } from '../ContentPreview'

import { parseContent, toFormat } from './ResponseDetails.utils'

export function Content({ data }: { data: ProxyData }) {
  const contentType = getContentType(data.response?.headers ?? [])
  const format = toFormat(contentType)
  const content = parseContent(format, data)

  if (!contentType || !content || !format) {
    return (
      <Flex height="200px" justify="center" align="center">
        No content
      </Flex>
    )
  }

  return (
    <ContentPreview
      data={data}
      format={format}
      content={content}
      contentType={contentType}
    />
  )
}
