import { Flex } from '@radix-ui/themes'
import { useEffect } from 'react'

import { useGeneratorStore } from '@/store/generator'
import { useApplyRules } from '@/store/hooks/useApplyRules'
import { ProxyData } from '@/types'
import { getContentType } from '@/utils/headers'

import { ContentPreview } from '../ContentPreview'
import { useGoToPayloadMatch } from '../Details.hooks'
import { Raw } from '../ResponseDetails/Raw'
import { toFormat } from '../ResponseDetails/ResponseDetails.utils'

import { FormPayloadPreview } from './FormPayloadPreview'
import { getRawContent, isJsonString, parseParams } from './utils'

function useUnmodifiedRequest(id: string) {
  const { selectedRuleInstance } = useApplyRules()
  const requests = useGeneratorStore((store) => store.requests)

  if (!selectedRuleInstance) {
    return requests.find((request) => request.id === id)?.request
  }

  if (!('requestsReplaced' in selectedRuleInstance.state)) {
    return
  }
  const request = selectedRuleInstance?.state.requestsReplaced.find(
    (request) => request.id === id
  )

  return request?.original
}

export function Payload({ data }: { data: ProxyData }) {
  const content = parseParams(data)
  const originalContentType = getContentType(data.request?.headers ?? [])
  const { searchString, index, reset } = useGoToPayloadMatch()
  const unmodifiedRequest = useUnmodifiedRequest(data.id)
  console.log('unmodifiedRequest', unmodifiedRequest)
  const originalContent =
    unmodifiedRequest && parseParams({ request: unmodifiedRequest })
  console.log('originalContent', originalContent)

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

  if (originalContentType === 'multipart/form-data') {
    return (
      <Raw
        content={content}
        format="text"
        searchString={searchString}
        searchIndex={index}
      />
    )
  }

  if (originalContentType === 'application/x-www-form-urlencoded') {
    return <FormPayloadPreview payloadJsonString={content} />
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
