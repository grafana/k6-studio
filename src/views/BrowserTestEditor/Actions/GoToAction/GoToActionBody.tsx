import { Grid } from '@radix-ui/themes'

import { UrlForm } from '../../ActionForms/forms/UrlForm'
import { BrowserActionInstance } from '../../types'

type Action = Extract<BrowserActionInstance, { method: 'page.goto' }>

interface GoToActionBodyProps {
  action: Action
  onChange: (action: Action) => void
}

export function GoToActionBody({ action, onChange }: GoToActionBodyProps) {
  const handleChangeUrl = (url: string) => {
    onChange({
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
