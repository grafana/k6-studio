import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'
import { Text } from '@radix-ui/themes'

interface OriginalContentProps {
  content: string
  format: string
}

export function OriginalContent({ content, format }: OriginalContentProps) {
  return (
    <Text size="1" wrap="pretty">
      <ReadOnlyEditor language={format} value={content} />
    </Text>
  )
}
