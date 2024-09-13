import { CodeEditor } from '@/components/Monaco/CodeEditor'
import { useScriptPreview } from '@/hooks/useScriptPreview'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { Box, Callout } from '@radix-ui/themes'

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
      </Box>
    )
  }

  return <CodeEditor readOnly value={preview} />
}
