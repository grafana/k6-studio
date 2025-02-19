import { Button, Flex, Select } from '@radix-ui/themes'
import { SelectingStackState, Stack } from '@/types/auth'
import { useState } from 'react'
import { ExternalLink } from '@/components/ExternalLink'
import { css } from '@emotion/react'
import { AuthenticationMessage } from './AuthenticationMessage'

interface SelectingStackProps {
  state: SelectingStackState
  onSelect: (stack: Stack) => void
}

export function SelectingStack({ state, onSelect }: SelectingStackProps) {
  const [selectedStackId, setSelectedStackId] = useState(
    state.stacks[0]?.id ?? ''
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
      {selectedStack?.archived && (
        <AuthenticationMessage>
          This stack is archived and cannot be logged in to.{' '}
          <ExternalLink href={selectedStack.url}>
            Login to the stack
          </ExternalLink>{' '}
          to unarchive it.
        </AuthenticationMessage>
      )}
      <Button
        disabled={!selectedStack || selectedStack.archived}
        onClick={handleSelect}
      >
        Login
      </Button>
    </Flex>
  )
}
