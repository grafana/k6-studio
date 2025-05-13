import { Flex } from '@radix-ui/themes'
import { useEffect } from 'react'

import { useOriginalRequest } from '@/store/generator/hooks/useOriginalRequest'
import { ProxyData } from '@/types'
import { getContentType } from '@/utils/headers'

import { ContentPreview } from '../ContentPreview'
import { useGoToPayloadMatch } from '../Details.hooks'
import { toFormat } from '../ResponseDetails/ResponseDetails.utils'

import { getRawContent, isJsonString, parseParams } from './utils'

export function Payload({ data }: { data: ProxyData }) {
  const content = parseParams(data.request)
  const { searchString, index, reset } = useGoToPayloadMatch()

  const originalRequest = useOriginalRequest(data.id)
  const originalContent = originalRequest && parseParams(originalRequest)
  const originalContentType = getContentType(originalRequest?.headers ?? [])

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

  const getContentTypeForContentPreview = () => {
    // It seems to be common to have JSON payloads with a content-type other than application/json
    // To support the preview of JSON payloads, we need to override the content type passed to <ContentPreview />
    const isJson = isJsonString(content || '')
    if (isJson) {
      return 'application/json'
    }

    if (!originalContentType) {
      return 'text/plain'
    }

    return originalContentType
  }

  const peviewContentType = getContentTypeForContentPreview()
  const format = toFormat(peviewContentType) || 'plaintext'

  return (
    <ContentPreview
      format={format}
      content={content}
      rawContent={getRawContent(content)}
      contentType={peviewContentType}
      searchIndex={index}
      searchString={searchString}
      originalContent={originalContent}
    />
  )
}
