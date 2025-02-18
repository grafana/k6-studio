import { css } from '@emotion/react'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { Callout, Flex, ScrollArea } from '@radix-ui/themes'

interface ScriptPreviewErrorProps {
  error: Error
}

export function ScriptPreviewError({ error }: ScriptPreviewErrorProps) {
  return (
    <Flex flexGrow="1" p="2" direction="column">
      <Callout.Root color="amber" role="alert" variant="surface" size="1">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          Failed to generate script preview. Make sure your custom code snippets
          do not contain syntax errors.
        </Callout.Text>
      </Callout.Root>

      <Flex
        direction="column"
        flexGrow="1"
        mt="4"
        css={css`
          border-top: 1px solid var(--gray-7);
        `}
        asChild
      >
        <ScrollArea scrollbars="vertical">
          <pre
            css={css`
              font-size: 13px;
            `}
          >
            {error.message}
          </pre>
        </ScrollArea>
      </Flex>
    </Flex>
  )
}
