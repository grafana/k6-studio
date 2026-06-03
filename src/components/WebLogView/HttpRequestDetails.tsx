import { css } from '@emotion/react'
import { Box, Flex, Heading, IconButton } from '@radix-ui/themes'
import { XIcon } from 'lucide-react'
import { PropsWithChildren, useEffect } from 'react'

import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
} from '@/components/primitives/ResizablePanel'
import { ProxyData } from '@/types'

import { RequestDetails } from './RequestDetails'
import { ResponseDetails } from './ResponseDetails'

interface HttpRequestDetailsProps {
  layout?: ReturnType<typeof useDefaultLayout>
  selectedRequest: ProxyData
  onSelectRequest: (data: ProxyData | null) => void
}

export function HttpRequestDetails({
  layout,
  selectedRequest,
  onSelectRequest,
}: HttpRequestDetailsProps) {
  useEffect(() => {
    return () => {
      onSelectRequest(null)
    }
  }, [onSelectRequest])

  return (
    <div
      css={css`
        position: relative;
        height: 100%;
      `}
    >
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
          <XIcon />
        </IconButton>
      </Box>
      <Group orientation="vertical" {...layout}>
        <Panel id="request" minSize={200}>
          <PaneContent heading="Request">
            <RequestDetails data={selectedRequest} />
          </PaneContent>
        </Panel>
        {selectedRequest.response && (
          <>
            <Separator />
            <Panel id="response" minSize={200}>
              <PaneContent heading="Response">
                <ResponseDetails data={selectedRequest} />
              </PaneContent>
            </Panel>
          </>
        )}
      </Group>
    </div>
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
