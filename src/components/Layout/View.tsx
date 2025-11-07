import { css } from '@emotion/react'
import { Flex, Spinner } from '@radix-ui/themes'
import { PropsWithChildren, ReactNode, useEffect, useState } from 'react'

import { ViewHeading } from './ViewHeading'

function LoadingSpinner() {
  const [showSpinner, setShowSpinner] = useState(false)

  useEffect(() => {
    // Only show the spinner if loading takes more than 50ms to avoid flickering
    const timeout = setTimeout(() => {
      setShowSpinner(true)
    }, 50)

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  return (
    <Flex
      css={css`
        flex: 1 1 0;
      `}
      align="center"
      justify="center"
      maxHeight="800px"
    >
      {showSpinner && (
        <Spinner
          css={css`
            transform: translateY(-50%);
          `}
        />
      )}
    </Flex>
  )
}

interface ViewProps {
  title: string
  subTitle?: ReactNode
  actions: ReactNode
  loading?: boolean
}

export function View({
  title,
  subTitle,
  actions,
  loading = false,
  children,
}: PropsWithChildren<ViewProps>) {
  return (
    <Flex direction="column" overflow="hidden" width="100%" height="100%">
      <ViewHeading title={title} subTitle={subTitle}>
        {actions}
      </ViewHeading>
      {loading ? <LoadingSpinner /> : children}
    </Flex>
  )
}
