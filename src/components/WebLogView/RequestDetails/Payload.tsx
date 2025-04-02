import { Flex } from '@radix-ui/themes'
import { useEffect } from 'react'

import { ProxyData } from '@/types'
import { getContentType } from '@/utils/headers'

import { ContentPreview } from '../ContentPreview'
import { useGoToPayloadMatch } from '../Details.hooks'
import { Raw } from '../ResponseDetails/Raw'
import { toFormat } from '../ResponseDetails/ResponseDetails.utils'

import { FormPayloadPreview } from './FormPayloadPreview'
import { getRawContent, parseParams } from './utils'

export function Payload({ data }: { data: ProxyData }) {
  const content = parseParams(data)
  const contentType = getContentType(data.request?.headers ?? [])
  const format = toFormat(contentType) || 'text/plain'
  const { searchString, index, reset } = useGoToPayloadMatch()

  // Reset payload search on unmount
  useEffect(() => {
    return reset
  }, [reset])

  if (!content) {
    return (
      <Flex height="200px" justify="center" align="center">
        No payload
      </Flex>
    )
  }

  if (contentType === 'multipart/form-data') {
    return (
      <Raw
        content={content}
        format="text"
        searchString={searchString}
        searchIndex={index}
      />
    )
  }

  if (contentType === 'application/x-www-form-urlencoded') {
    return <FormPayloadPreview payloadJsonString={content} />
  }

  return (
    <ContentPreview
      format={format}
      content={content}
      rawContent={getRawContent(content)}
      contentType={contentType || 'text/plain'}
      searchIndex={index}
      searchString={searchString}
    />
  )
}
