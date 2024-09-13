import { css } from '@emotion/react'
import { Spinner, Text } from '@radix-ui/themes'

type TextSpinnerProps = { text: string }

export default function TextSpinner({ text }: TextSpinnerProps) {
  return (
    <>
      <Spinner />{' '}
      <Text
        css={css`
          font-size: 14px;
        `}
      >
        {text}
      </Text>
    </>
  )
}
