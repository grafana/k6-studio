import { Allotment } from 'allotment'
import { PropsWithChildren, useEffect } from 'react'
import { css } from '@emotion/react'
import { Box, Flex, Heading, IconButton } from '@radix-ui/themes'
import { Cross2Icon } from '@radix-ui/react-icons'

import { ProxyData } from '@/types'
import { RequestDetails } from './RequestDetails'
import { ResponseDetails } from './ResponseDetails'

interface DetailsProps {
  requests: ProxyData[]
  selectedRequestId?: string
  onSelectRequest: (data: ProxyData | null) => void
}

export function Details({
  requests,
  selectedRequestId,
  onSelectRequest,
}: DetailsProps) {
  const data = requests.find((r) => r.id === selectedRequestId)

  useEffect(() => {
    if (data === undefined) {
      onSelectRequest(null)
    }
  }, [data, onSelectRequest, selectedRequestId])

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
      {data !== undefined && (
        <Box height="100%">
          <Allotment defaultSizes={[1, 1]} vertical>
            <Allotment.Pane minSize={200}>
              <PaneContent heading="Request">
                <RequestDetails data={data} />
              </PaneContent>
            </Allotment.Pane>
            <Allotment.Pane minSize={200}>
              <PaneContent heading="Response">
                <ResponseDetails data={data} />
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
        p="2"
        css={css`
          background-color: var(--accent-3);
          flex-shrink: 0;
        `}
      >
        <Heading size="2">{heading}</Heading>
      </Box>
      {children}
    </Flex>
  )
}
