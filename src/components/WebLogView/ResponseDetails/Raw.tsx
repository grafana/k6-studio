import { Text } from '@radix-ui/themes'
import { css } from '@emotion/react'
import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'

interface RawProps {
  content: string
  format?: string
}

export function Raw({ content, format }: RawProps) {
  return (
    <Text size="1" wrap="pretty" css={style}>
      <ReadOnlyEditor language={format} value={content} />
    </Text>
  )
}

const style = css`
  margin: 0;
`
