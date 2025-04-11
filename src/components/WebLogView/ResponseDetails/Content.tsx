import { Flex } from '@radix-ui/themes'
import { useEffect } from 'react'

import { ProxyData } from '@/types'
import { getContentType } from '@/utils/headers'

import { ContentPreview } from '../ContentPreview'
import { useGoToContentMatch } from '../Details.hooks'

import { parseContent, toFormat } from './ResponseDetails.utils'

export function Content({ data }: { data: ProxyData }) {
  const contentType = getContentType(data.response?.headers ?? [])
  const format = toFormat(contentType)
  const content = parseContent(format, data)
  const rawFormat = format === 'json' ? 'json-raw' : format
  const rawContent = parseContent(rawFormat, data)
  const { searchString, index, reset } = useGoToContentMatch()

  // Reset search string on unmount
  useEffect(() => {
    return reset
  }, [reset])

  if (!contentType || !content || !format) {
    return (
      <Flex height="200px" justify="center" align="center">
        No content
      </Flex>
    )
  }

  return (
    <ContentPreview
      format={format}
      content={content}
      rawContent={rawContent}
      contentType={contentType}
      searchIndex={index}
      searchString={searchString}
    />
  )
}
