import { Flex, Heading, Tooltip } from '@radix-ui/themes'
import { css } from '@emotion/react'
import { DividerVerticalIcon } from '@radix-ui/react-icons'
import { useRef } from 'react'
import { useOverflowCheck } from '@/hooks/useOverflowCheck'

export function PageHeading({
  title,
  subTitle,
  children,
}: {
  title: string
  subTitle?: string
  children: React.ReactNode
}) {
  const subTitleRef = useRef<HTMLHeadingElement>(null)
  const hasEllipsis = useOverflowCheck(subTitleRef)

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
        <Flex maxWidth="50%" flexGrow="1" gap="1" align="center">
          <Heading size="2">{title}</Heading>
          {!!subTitle && (
            <>
              <DividerVerticalIcon aria-hidden />
              <Tooltip content={subTitle} hidden={!hasEllipsis}>
                <Heading
                  size="2"
                  weight="medium"
                  color="gray"
                  truncate
                  ref={subTitleRef}
                >
                  {subTitle}
                </Heading>
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
