import { Grid } from '@radix-ui/themes'

import { PageGotoAction } from '@/main/runner/schema'

import { UrlForm } from '../ActionForms/forms/UrlForm'
import { WithEditorMetadata } from '../types'

interface GoToActionBodyProps {
  action: WithEditorMetadata<PageGotoAction>
  onUpdate: (action: WithEditorMetadata<PageGotoAction>) => void
}

export function GoToActionBody({ action, onUpdate }: GoToActionBodyProps) {
  const handleChangeUrl = (url: string) => {
    onUpdate({
      ...action,
      url,
    })
  }

  return (
    <Grid columns="max-content auto" gap="2" align="center">
      Navigate to <UrlForm value={action.url} onChange={handleChangeUrl} />
    </Grid>
  )
}
