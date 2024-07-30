import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'
import { Flex, Heading } from '@radix-ui/themes'

interface ScriptPaneContentProps {
  script: string
}

export function ScriptPaneContent({ script }: ScriptPaneContentProps) {
  return (
    <Flex maxHeight="100%" height="100%" direction="column" p="2">
      <Heading size="2" mb="2">
        Script
      </Heading>
      <ReadOnlyEditor language="javascript" value={script} />
    </Flex>
  )
}
