import { useChat } from '@ai-sdk/react'
import { css } from '@emotion/react'
import { Box, Button, Callout, Flex, Spinner, Text } from '@radix-ui/themes'
import type { UIMessage } from 'ai'
import {
  AlertTriangleIcon,
  BrainIcon,
  ChevronRightIcon,
  SendIcon,
} from 'lucide-react'
import { useState } from 'react'

import { IPCChatTransport } from './utils/IPCChatTransport'

const transport = new IPCChatTransport({
  provider: 'grafana-assistant',
})

export function AssistantTestChat() {
  const { sendMessage, messages, status, error } = useChat({
    transport,
  })

  const isLoading = status === 'submitted' || status === 'streaming'
  const isStreaming = status === 'streaming'
  const assistantMessages = messages.filter((m) => m.role === 'assistant')
  const lastAssistantMessage = assistantMessages.at(-1)

  function handleSendTestMessage() {
    void sendMessage({
      text: 'Hello, can you confirm you are connected?',
    })
  }

  return (
    <Flex direction="column" align="center" gap="3" width="100%">
      <Button size="3" onClick={handleSendTestMessage} disabled={isLoading}>
        {isLoading ? <Spinner /> : <SendIcon size={16} />}
        Send test message
      </Button>

      {error && (
        <Callout.Root color="red" size="1">
          <Callout.Icon>
            <AlertTriangleIcon size={16} />
          </Callout.Icon>
          <Callout.Text>{error.message}</Callout.Text>
        </Callout.Root>
      )}

      {lastAssistantMessage && (
        <MessageContent
          message={lastAssistantMessage}
          isStreaming={isStreaming}
        />
      )}
    </Flex>
  )
}

function MessageContent({
  message,
  isStreaming,
}: {
  message: UIMessage
  isStreaming: boolean
}) {
  const reasoningText = message.parts
    .filter((p) => p.type === 'reasoning')
    .map((p) => p.text)
    .join('')

  const responseText = message.parts
    .filter((p) => p.type === 'text')
    .map((p) => p.text)
    .join('')

  const hasReasoning = reasoningText.length > 0
  const hasResponse = responseText.length > 0
  const isThinking = isStreaming && hasReasoning && !hasResponse

  return (
    <Flex direction="column" gap="2" width="100%" css={containerStyle}>
      {hasReasoning && (
        <ThinkingBlock text={reasoningText} isActive={isThinking} />
      )}
      {hasResponse && (
        <Text size="2" css={responseStyle}>
          {responseText}
        </Text>
      )}
    </Flex>
  )
}

function ThinkingBlock({
  text,
  isActive,
}: {
  text: string
  isActive: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Box>
      <button
        type="button"
        css={headerStyle}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isActive ? 'Thinking in progress' : 'View thinking'}
        aria-expanded={isExpanded}
      >
        <BrainIcon size={14} css={iconStyle} />
        <Text size="1" color="gray">
          {isActive ? 'thinking...' : 'thought'}
        </Text>
        <ChevronRightIcon size={12} css={chevronStyle(isExpanded)} />
      </button>
      <Text
        size="1"
        color="gray"
        css={isExpanded ? expandedStyle : previewStyle}
      >
        {isExpanded
          ? text
          : text.slice(0, 120) + (text.length > 120 ? '...' : '')}
      </Text>
    </Box>
  )
}

const containerStyle = css`
  max-width: 480px;
`

const responseStyle = css`
  white-space: pre-wrap;
  line-height: 1.5;
`

const headerStyle = css`
  all: unset;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--focus-8);
    outline-offset: 2px;
    border-radius: var(--radius-1);
  }
`

const iconStyle = css`
  color: var(--gray-8);
  flex-shrink: 0;
`

const chevronStyle = (expanded: boolean) => css`
  color: var(--gray-8);
  flex-shrink: 0;
  transition: transform 150ms ease;
  transform: rotate(${expanded ? '90deg' : '0deg'});
`

const previewStyle = css`
  display: block;
  margin-top: var(--space-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const expandedStyle = css`
  display: block;
  margin-top: var(--space-1);
  white-space: pre-wrap;
  line-height: 1.4;
  max-height: 200px;
  overflow-y: auto;
`
