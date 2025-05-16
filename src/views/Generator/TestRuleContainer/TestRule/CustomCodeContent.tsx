import { Strong, Text, Tooltip } from '@radix-ui/themes'
import { EyeIcon } from 'lucide-react'

import { CustomCodeRule } from '@/types/rules'

export function CustomCodeContent({ rule }: { rule: CustomCodeRule }) {
  return (
    <>
      Insert <CodeSnippetPreview snippet={rule.snippet} />{' '}
      <Strong>{rule.placement === 'before' ? 'before' : 'after'}</Strong>{' '}
      request
    </>
  )
}

export function CodeSnippetPreview({ snippet }: { snippet: string }) {
  return (
    <Tooltip
      content={
        <pre>
          <code>{snippet}</code>
        </pre>
      }
    >
      <Text>
        <EyeIcon /> <Strong>snippet</Strong>
      </Text>
    </Tooltip>
  )
}
