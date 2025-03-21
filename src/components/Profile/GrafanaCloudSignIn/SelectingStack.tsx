import { css } from '@emotion/react'
import { Button, Flex } from '@radix-ui/themes'
import { useState } from 'react'
import { SingleValue } from 'react-select'

import { ExternalLink } from '@/components/ExternalLink'
import { StyledReactSelect } from '@/components/StyledReactSelect'
import { TextButton } from '@/components/TextButton'
import { SelectingStackState, Stack } from '@/types/auth'

import { AuthenticationMessage } from './AuthenticationMessage'

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
  const [selectedStack, setSelectedStack] = useState(
    state.current ?? state.stacks[0] ?? null
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

  const handleValueChange = (value: SingleValue<Stack>) => {
    setSelectedStack(value)
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
      <div
        css={css`
          position: relative;
        `}
      >
        <StyledReactSelect
          menuPosition="absolute"
          value={selectedStack ?? null}
          options={state.stacks}
          getOptionValue={(option) => option.id}
          getOptionLabel={(option) => option.name}
          onChange={handleValueChange}
        />
      </div>

      {selectedStack?.status === 'archived' && (
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
          <TextButton onClick={handleRefresh}>refresh.</TextButton>
        </AuthenticationMessage>
      )}
      {selectedStack?.status === 'restoring' && (
        <AuthenticationMessage>
          The stack is being restored. Please wait a moment and{' '}
          <TextButton onClick={handleRefresh}>refresh.</TextButton>
        </AuthenticationMessage>
      )}
      <Button
        disabled={
          selectedStack === null ||
          selectedStack.status === 'archived' ||
          selectedStack.status === 'restoring'
        }
        onClick={handleSelect}
      >
        Continue
      </Button>
    </Flex>
  )
}
