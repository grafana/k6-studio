import { css } from '@emotion/react'
import { Spinner, Text } from '@radix-ui/themes'
import { ComponentProps } from 'react'

type TextSpinnerProps = {
  text: string
  color?: ComponentProps<typeof Text>['color']
}

export default function TextSpinner({ text, color }: TextSpinnerProps) {
  return (
    <>
      <Spinner />{' '}
      <Text
        color={color}
        css={css`
          font-size: 14px;
        `}
      >
        {text}
      </Text>
    </>
  )
}
