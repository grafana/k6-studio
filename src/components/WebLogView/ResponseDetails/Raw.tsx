import { css } from '@emotion/react'
import { Text } from '@radix-ui/themes'

import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'

interface RawProps {
  content: string
  format?: string
  searchString?: string
  searchIndex?: number
}

export function Raw({ content, format, ...props }: RawProps) {
  return (
    <Text size="1" wrap="pretty" css={style}>
      <ReadOnlyEditor language={format} value={content} {...props} />
    </Text>
  )
}

const style = css`
  margin: 0;
`
