import { css } from '@emotion/react'
import { Callout, Flex, ScrollArea } from '@radix-ui/themes'
import { AlertTriangleIcon } from 'lucide-react'

interface ScriptPreviewErrorProps {
  error: Error
}

export function ScriptPreviewError({ error }: ScriptPreviewErrorProps) {
  return (
    <Flex
      direction="column"
      gap="2"
      p="2"
      css={css`
        position: absolute;
        inset: 0;
        background: var(--color-background);
        z-index: 5;
      `}
    >
      <Callout.Root role="alert" variant="soft" color="red" size="1">
        <Callout.Icon>
          <AlertTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          Script generation failed. Check your code snippets for errors.
        </Callout.Text>
      </Callout.Root>

      <Flex direction="column" flexGrow="1" asChild>
        <ScrollArea scrollbars="vertical">
          <pre
            css={css`
              margin: 0;
              font-size: 12px;
            `}
          >
            {error.name}: {error.message}
          </pre>
        </ScrollArea>
      </Flex>
    </Flex>
  )
}
