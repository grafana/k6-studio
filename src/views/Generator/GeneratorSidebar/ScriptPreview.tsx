import { CodeEditor } from '@/components/Monaco/CodeEditor'
import { useScriptPreview } from '@/hooks/useScriptPreview'
import { Callout } from '@radix-ui/themes'

export function ScriptPreview() {
  const { preview, error } = useScriptPreview()

  if (error) {
    return (
      <Callout.Root color="amber" role="alert" variant="surface">
        Failed to generate script preview. Please make sure your custom code
        snippets do not contain syntax errors.
      </Callout.Root>
    )
  }

  return <CodeEditor readOnly value={preview} />
}
