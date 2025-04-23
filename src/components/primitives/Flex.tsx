import { css } from '@emotion/react'
import { ReactNode } from 'react'

const styles = css`
  display: flex;

  &[data-direction='column'] {
    flex-direction: column;
  }

  &[data-align='start'] {
    align-items: flex-start;
  }

  &[data-align='center'] {
    align-items: center;
  }

  &[data-align='end'] {
    align-items: flex-end;
  }

  &[data-align='stretch'] {
    align-items: stretch;
  }

  &[data-justify='start'] {
    justify-content: flex-start;
  }

  &[data-justify='center'] {
    justify-content: center;
  }

  &[data-justify='end'] {
    justify-content: flex-end;
  }

  &[data-justify='between'] {
    justify-content: space-between;
  }

  &[data-justify='around'] {
    justify-content: space-around;
  }
`

interface FlexProps {
  direction?: 'row' | 'column'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  gap?: '0' | '1' | '2' | '3' | '4'
  p?: '0' | '1' | '2' | '3' | '4'
  px?: '0' | '1' | '2' | '3' | '4'
  py?: '0' | '1' | '2' | '3' | '4'
  children?: ReactNode
}

export function Flex({
  direction = 'row',
  align = 'center',
  justify = 'start',
  p,
  px,
  py,
  gap = '0',
  children,
}: FlexProps) {
  return (
    <div
      data-direction={direction}
      data-align={align}
      data-justify={justify}
      data-gap={gap}
      data-p={p}
      data-px={px}
      data-py={py}
      css={styles}
    >
      {children}
    </div>
  )
}
