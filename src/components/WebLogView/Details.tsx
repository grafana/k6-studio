import { css } from '@emotion/react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { Box, Flex, Heading, IconButton } from '@radix-ui/themes'
import { Allotment } from 'allotment'
import * as JsDiff from 'diff'
import { PropsWithChildren, useEffect } from 'react'

import { useGeneratorStore } from '@/store/generator'
import { useApplyRules } from '@/store/hooks/useApplyRules'
import { Header, ProxyData, ProxyDataWithMatches } from '@/types'
import { SearchMatch } from '@/types/fuse'

import { RequestDetails } from './RequestDetails'
import { ResponseDetails } from './ResponseDetails'

interface DetailsProps {
  selectedRequest: ProxyData | null
  onSelectRequest: (data: ProxyData | null) => void
}

export type ProxyDataWithDiff = {
  id: ProxyData['id']
  response?: ProxyData['response']
  request: {
    headers: Array<{ name: string; value: string; diff: JsDiff.Change[] }>
  }
}

function useOriginalRequest(id?: string) {
  const { selectedRuleInstance } = useApplyRules()
  const requests = useGeneratorStore((store) => store.requests)

  if (!id) {
    return
  }

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

function useDiff(
  selectedRequest: ProxyDataWithMatches | null
): SearchMatch[] | undefined {
  const originalRequest = useOriginalRequest(selectedRequest?.id)

  const modified = selectedRequest?.request

  if (!originalRequest || !modified) {
    return
  }

  const requestHeaderMatches = getHeaderMatches(
    originalRequest.headers,
    modified.headers,
    'request.headers'
  )

  const urlDiff = JsDiff.diffWords(
    originalRequest.url ?? '',
    modified.url ?? ''
  )
  const urlMatches = [
    {
      indices: diffToMatches(urlDiff),
      key: 'request.url',
      value: modified.url,
    },
  ]

  return [...requestHeaderMatches, ...urlMatches]
}

function getHeaderMatches(
  originalHeaders: Header[],
  headers: Header[],
  key: string
) {
  return headers.map((header, index): SearchMatch => {
    const originalValue = originalHeaders[index]?.[1]
    const value = header[1]
    const diff = JsDiff.diffWords(originalValue ?? '', value, {
      // maxEditLength: 10,
    })
    console.log('diffO', diff)
    if (diff.length < 2) {
      return undefined
    }
    console.log('value', value)

    return {
      indices: diffToMatches(diff),
      key,
      value,
    }
  })
}

function diffToMatches(diff: JsDiff.Change[]): SearchMatch['indices'] {
  const finalAccumulator = diff.reduce<{
    indices: SearchMatch['indices']
    start: number
  }>(
    (acc, part) => {
      if (part.added) {
        const newRange: [number, number] = [
          acc.start,
          acc.start + part.value.length - 1,
        ]
        return {
          indices: [...acc.indices, newRange],
          start: acc.start + part.value.length,
        }
      }

      if (!part.removed) {
        // Only advance start for non-removed parts
        return {
          ...acc,
          start: acc.start + part.value.length,
        }
      }

      // If part is removed, don't change accumulator
      return acc
    },
    { indices: [], start: 0 } // Initial accumulator
  )

  return finalAccumulator.indices
}

export function Details({ selectedRequest, onSelectRequest }: DetailsProps) {
  useEffect(() => {
    return () => {
      // onSelectRequest(null)
    }
  }, [onSelectRequest])
  const diff = useDiff(selectedRequest)

  if (!selectedRequest) {
    return null
  }
  console.log('selectedRequest', selectedRequest)

  // const original = {
  // ...selectedRequest,
  // request: {
  // ...selectedRequest?.request,
  // url: 'foobar',
  // },
  // }
  // const changes = JsDiff.diffJson(original, selectedRequest)
  // console.log('changes', changes)

  // const result = changes
  // .map((part) => {
  // if (part.added || part.removed) {
  // return '"REDACTED"'
  // }
  // return part.value
  // })
  // .join('')
  // console.log('parsed', JSON.parse(result))

  return (
    <>
      <Box
        p="2"
        position="absolute"
        right="0"
        top="0"
        pt="9px"
        css={css`
          z-index: 1;
        `}
      >
        <IconButton
          size="1"
          variant="ghost"
          onClick={() => onSelectRequest(null)}
        >
          <Cross2Icon />
        </IconButton>
      </Box>
      {selectedRequest !== null && (
        <Box height="100%">
          <Allotment defaultSizes={[1, 1]} vertical>
            <Allotment.Pane minSize={200}>
              <PaneContent heading="Request">
                <RequestDetails data={{ ...selectedRequest, matches: diff }} />
              </PaneContent>
            </Allotment.Pane>
            <Allotment.Pane minSize={200} visible={!!selectedRequest.response}>
              <PaneContent heading="Response">
                <ResponseDetails data={selectedRequest} />
              </PaneContent>
            </Allotment.Pane>
          </Allotment>
        </Box>
      )}
    </>
  )
}

interface PaneContentProps {
  heading: string
}

function PaneContent({
  children,
  heading,
}: PropsWithChildren<PaneContentProps>) {
  return (
    <Flex direction="column" height="100%">
      <Box
        py="2"
        px="4"
        css={css`
          background-color: var(--gray-2);
          flex-shrink: 0;
        `}
      >
        <Heading
          size="2"
          css={css`
            font-weight: 500;
          `}
        >
          {heading}
        </Heading>
      </Box>
      {children}
    </Flex>
  )
}
