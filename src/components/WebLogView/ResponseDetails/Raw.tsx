import { Text } from '@radix-ui/themes'
import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'

interface RawProps {
  content: string
  format: string
}

export function Raw({ content, format }: RawProps) {
  return (
    <Text size="1" wrap="pretty">
      <ReadOnlyEditor language={format} value={content} />
    </Text>
  )
}
