import { css } from '@emotion/react'
import { DividerVerticalIcon } from '@radix-ui/react-icons'
import { Flex, Heading, Tooltip } from '@radix-ui/themes'
import { PropsWithChildren, ReactNode, useRef } from 'react'

import { useOverflowCheck } from '@/hooks/useOverflowCheck'

interface PageHeadingProps {
  title: string
  subTitle?: string | ReactNode
}

export function PageHeading({
  title,
  subTitle,
  children,
}: PropsWithChildren<PageHeadingProps>) {
  const subTitleRef = useRef<HTMLHeadingElement>(null)
  const hasEllipsis = useOverflowCheck(subTitleRef)

  return (
    <>
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
          <Heading size="2">{title}</Heading>
          {!!subTitle && (
            <>
              <DividerVerticalIcon aria-hidden />
              <Tooltip content={subTitle} hidden={!hasEllipsis}>
                <Flex asChild gap="1" align="center">
                  <Heading
                    size="2"
                    weight="medium"
                    color="gray"
                    truncate
                    ref={subTitleRef}
                  >
                    {subTitle}
                  </Heading>
                </Flex>
              </Tooltip>
            </>
          )}
        </Flex>
        <Flex flexGrow="1" justify="end" align="center" gap="2" wrap="wrap">
          {children}
        </Flex>
      </Flex>
    </>
  )
}
