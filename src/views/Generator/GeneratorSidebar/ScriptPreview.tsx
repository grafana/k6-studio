import { CodeEditor } from '@/components/Monaco/CodeEditor'
import { useScriptPreview } from '@/hooks/useScriptPreview'
import { css } from '@emotion/react'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { Box, Callout, ScrollArea } from '@radix-ui/themes'

export function ScriptPreview() {
  const { preview, error } = useScriptPreview()

  if (error) {
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

        <Box>
          <ScrollArea
            scrollbars="vertical"
            css={css`
              height: calc(100vh - 170px);
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

  return <CodeEditor readOnly value={preview} />
}
