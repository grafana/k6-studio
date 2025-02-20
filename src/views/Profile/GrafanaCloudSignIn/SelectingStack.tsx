import { Button, Flex, Select } from '@radix-ui/themes'
import { SelectingStackState, Stack } from '@/types/auth'
import { useState } from 'react'
import { ExternalLink } from '@/components/ExternalLink'
import { css } from '@emotion/react'
import { AuthenticationMessage } from './AuthenticationMessage'
import { LinkButton } from '@/components/LinkButton'

interface SelectingStackProps {
  state: SelectingStackState
  onSelect: (stack: Stack) => void
  onRefresh: (current: Stack) => void
}

export function SelectingStack({
  state,
  onSelect,
  onRefresh,
}: SelectingStackProps) {
  const [selectedStackId, setSelectedStackId] = useState(
    state.current?.id ?? state.stacks[0]?.id ?? ''
  )

  const selectedStack = state.stacks.find(
    (stack) => stack.id === selectedStackId
  )

  const handleSelect = () => {
    if (!selectedStack) {
      return
    }

    onSelect(selectedStack)
  }

  const handleRefresh = () => {
    if (!selectedStack) {
      return
    }

    onRefresh(selectedStack)
  }

  return (
    <Flex
      direction="column"
      align="stretch"
      gap="2"
      minWidth="300px"
      maxWidth="300px"
    >
      <div
        css={css`
          text-align: center;
        `}
      >
        Select a stack...
      </div>
      <Select.Root value={selectedStackId} onValueChange={setSelectedStackId}>
        <Select.Trigger
          css={css`
            text-align: center;
          `}
        />
        <Select.Content>
          {state.stacks.map((stack) => (
            <Select.Item key={stack.id} value={stack.id}>
              {stack.name}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>

      {selectedStack?.status === 'archived' && (
        <>
          <AuthenticationMessage>
            This stack is archived and you must{' '}
            <ExternalLink
              css={css`
                white-space: nowrap;
              `}
              href={selectedStack.url}
            >
              log in
            </ExternalLink>{' '}
            to it before continuing. Wait a few minutes and{' '}
            <LinkButton onClick={handleRefresh}>refresh.</LinkButton>
          </AuthenticationMessage>
        </>
      )}
      {selectedStack?.status === 'restoring' && (
        <>
          <AuthenticationMessage>
            The stack is being restored. Please wait a moment and{' '}
            <LinkButton onClick={handleRefresh}>refresh.</LinkButton>
          </AuthenticationMessage>
        </>
      )}
      <Button
        disabled={
          selectedStack === undefined ||
          selectedStack.status === 'archived' ||
          selectedStack.status === 'restoring'
        }
        onClick={handleSelect}
      >
        Login
      </Button>
    </Flex>
  )
}
