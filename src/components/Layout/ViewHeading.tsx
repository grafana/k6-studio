import { css } from '@emotion/react'
import { Flex, Heading } from '@radix-ui/themes'
import { MinusIcon } from 'lucide-react'
import { PropsWithChildren, ReactNode } from 'react'

interface ViewHeadingProps {
  title: string
  subTitle?: ReactNode
}

export function ViewHeading({
  title,
  subTitle,
  children,
}: PropsWithChildren<ViewHeadingProps>) {
  return (
    <Flex
      gap="2"
      align="center"
      p="2"
      css={css`
        border-bottom: 1px solid var(--gray-4);
        min-height: 49px;
      `}
    >
      <Flex maxWidth="50%" flexGrow="1" gap="1" align="center">
        <Heading
          size="2"
          css={css`
            flex-shrink: 0;
          `}
        >
          {title}
        </Heading>
        {!!subTitle && (
          <>
            <MinusIcon
              aria-hidden
              css={css`
                flex-shrink: 0;
              `}
            />
            {subTitle}
          </>
        )}
      </Flex>
      <Flex flexGrow="1" justify="end" align="center" gap="2" wrap="wrap">
        {children}
      </Flex>
    </Flex>
  )
}
