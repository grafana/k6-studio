import { Text } from '@radix-ui/themes'
import { css } from '@emotion/react'

interface RawProps {
  content: string
}

export function Raw({ content }: RawProps) {
  return (
    <Text size="1" wrap="pretty">
      <pre css={style}>
        <code>{content}</code>
      </pre>
    </Text>
  )
}

const style = css`
  margin: 0;
`
