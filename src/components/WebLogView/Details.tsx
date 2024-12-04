import { Allotment } from 'allotment'
import { PropsWithChildren, useEffect } from 'react'
import { css } from '@emotion/react'
import { Box, Flex, Heading, IconButton, Tabs } from '@radix-ui/themes'
import { Cross2Icon } from '@radix-ui/react-icons'

import { ProxyData } from '@/types'
import { RequestDetails } from './RequestDetails'
import { ResponseDetails } from './ResponseDetails'

interface DetailsProps {
  type?: 'accordion' | 'panels'
  orientation?: 'horizontal' | 'vertical'
  selectedRequest: ProxyData | null
  onSelectRequest: (data: ProxyData | null) => void
}

export function Details({
  type = 'panels',
  orientation = 'vertical',
  selectedRequest,
  onSelectRequest,
}: DetailsProps) {
  useEffect(() => {
    return () => {
      onSelectRequest(null)
    }
  }, [onSelectRequest])

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
        <Box height="100%" width="100%">
          {type === 'accordion' && (
            <Tabs.Root defaultValue="request">
              <Tabs.List
                css={css`
                  background-color: var(--gray-2);
                  flex-shrink: 0;
                `}
              >
                <Tabs.Trigger value="request">Request</Tabs.Trigger>
                <Tabs.Trigger value="response">Response</Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="request">
                <RequestDetails data={selectedRequest} />
              </Tabs.Content>
              <Tabs.Content value="response">
                <ResponseDetails data={selectedRequest} />
              </Tabs.Content>
            </Tabs.Root>
          )}
          {type === 'panels' && (
            <Allotment
              defaultSizes={[1, 1]}
              vertical={orientation === 'vertical'}
            >
              <Allotment.Pane minSize={200}>
                <PaneContent heading="Request">
                  <RequestDetails data={selectedRequest} />
                </PaneContent>
              </Allotment.Pane>
              <Allotment.Pane
                minSize={200}
                visible={!!selectedRequest.response}
              >
                <PaneContent heading="Response">
                  <ResponseDetails data={selectedRequest} />
                </PaneContent>
              </Allotment.Pane>
            </Allotment>
          )}
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
