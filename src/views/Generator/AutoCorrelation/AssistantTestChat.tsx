import { useChat } from '@ai-sdk/react'
import { Button, Callout, Flex, Spinner, Text } from '@radix-ui/themes'
import { AlertTriangleIcon, CheckCircleIcon, SendIcon } from 'lucide-react'

import { IPCChatTransport } from './utils/IPCChatTransport'

const transport = new IPCChatTransport({
  provider: 'grafana-assistant',
})

export function AssistantTestChat() {
  const { sendMessage, messages, status, error } = useChat({
    transport,
  })

  const isLoading = status === 'submitted' || status === 'streaming'
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
        {isLoading ? <Spinner /> : <SendIcon />}
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
        <Flex align="center" gap="2">
          <CheckCircleIcon size={16} color="var(--green-9)" />
          <Text size="2" color="gray">
            {lastAssistantMessage.parts
              .filter((p) => p.type === 'text')
              .map((p) => p.text)
              .join('')}
          </Text>
        </Flex>
      )}
    </Flex>
  )
}
