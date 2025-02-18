import {
  Button,
  Flex,
  Heading,
  Select,
  Separator,
  Text,
} from '@radix-ui/themes'
import { Avatar } from '../Avatar'
import { SignedInState, SignInState } from './types'
import { css } from '@emotion/react'

interface SignedInStateProps {
  state: SignedInState
  onStateChange: (state: SignInState) => void
}

export function SignedIn({ state, onStateChange }: SignedInStateProps) {
  const handleSignIn = () => {
    onStateChange({
      type: 'signing-in',
      state: {
        type: 'initializing',
      },
    })
  }

  const handleSignOut = () => {
    onStateChange({
      type: 'confirm-sign-out',
      user: state.user,
    })
  }

  const handleStackChange = (value: string) => {
    const stack = state.user.stacks[value]

    if (!stack) {
      return
    }

    window.studio.auth
      .changeStack(stack.id)
      .then((user) => {
        onStateChange({
          type: 'signed-in',
          user,
        })
      })
      .catch(() => {
        console.error('Failed to change stack')
      })
  }

  return (
    <Flex direction="column" align="center" gap="5">
      <Avatar />
      <Flex direction="column" align="center" gap="2">
        <Flex direction="column">
          <Text align="center" mb="0">
            Signed in as
          </Text>
          <Heading weight="bold" size="5">
            {state.user.email}
          </Heading>
        </Flex>

        <Select.Root
          value={state.user.currentStack}
          onValueChange={handleStackChange}
        >
          <Select.Trigger
            css={css`
              align-self: stretch;
            `}
          />
          <Select.Content>
            {Object.values(state.user.stacks).map((stack) => {
              return (
                <Select.Item
                  key={stack.id}
                  value={stack.id}
                  css={css`
                    &:first-child {
                      border-bottom-left-radius: 0;
                      border-bottom-right-radius: 0;
                    }

                    &:last-child {
                      border-top-left-radius: 0;
                      border-top-right-radius: 0;
                    }
                  `}
                >
                  {stack.name}
                </Select.Item>
              )
            })}
          </Select.Content>
        </Select.Root>

        <Button
          css={css`
            align-self: stretch;
          `}
          variant="outline"
          onClick={handleSignIn}
        >
          Sign in to another stack
        </Button>
        <Separator size="4" />
        <Button size="2" variant="ghost" onClick={handleSignOut}>
          Sign out
        </Button>
      </Flex>
    </Flex>
  )
}
