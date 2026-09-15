import { css } from '@emotion/react'
import { Flex, Heading, Separator } from '@radix-ui/themes'
import { PropsWithChildren, ReactNode } from 'react'

interface ViewHeadingProps {
  title: string
  subTitle?: ReactNode
}

/**
 * The floor the title group shrinks to before the actions give anything up.
 * Actions that collapse against the row width (GeneratorControls) build their
 * container-query breakpoints on top of this value.
 */
export const TITLE_GROUP_MIN_WIDTH = 280

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
        /* Lets the actions collapse their labels with container queries
           against the row width. */
        container-type: inline-size;
      `}
    >
      {/* The title group takes what its content needs and yields to the
          actions when the row tightens: it shrinks (truncating a long file
          name) down to this floor before the actions give anything up. */}
      <Flex gap="2" align="center" css={{ minWidth: TITLE_GROUP_MIN_WIDTH }}>
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
            <Separator orientation="vertical" />
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
