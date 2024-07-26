import { Flex, Heading } from '@radix-ui/themes'
import { css } from '@emotion/react'

export function PageHeading({
  text,
  children,
}: {
  text: string
  children: React.ReactNode
}) {
  return (
    <>
      <Flex
        gap="2"
        align="center"
        p="2"
        css={css`
          background-color: var(--gray-2);
          border-bottom: 1px solid var(--gray-4);
        `}
      >
        <Flex maxWidth="50%" flexGrow="1">
          <Heading size="3">{text}</Heading>
        </Flex>
        <Flex flexGrow="1" justify="end" align="center" gap="2">
          {children}
        </Flex>
      </Flex>
    </>
  )
}
