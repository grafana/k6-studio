import { css } from '@emotion/react'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { Box, Callout, ScrollArea } from '@radix-ui/themes'

interface ScriptPreviewErrorProps {
  error: Error
}

export function ScriptPreviewError({ error }: ScriptPreviewErrorProps) {
  return (
    <Box p="2">
      <Callout.Root color="amber" role="alert" variant="surface" size="1">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          Failed to generate script preview. Please make sure your custom code
          snippets do not contain syntax errors.
        </Callout.Text>
      </Callout.Root>

      <Box
        mt="4"
        css={css`
          border-top: 1px solid var(--gray-7);
        `}
      >
        <ScrollArea
          scrollbars="vertical"
          css={css`
            height: calc(100vh - 190px);
          `}
        >
          <pre
            css={css`
              font-size: 13px;
            `}
          >
            {error.message}
          </pre>
        </ScrollArea>
      </Box>
    </Box>
  )
}
