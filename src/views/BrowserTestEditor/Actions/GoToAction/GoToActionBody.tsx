import { Grid } from '@radix-ui/themes'

import { PageGotoAction } from '@/schemas/browserTest'

import { UrlForm } from '../../ActionForms/forms/UrlForm'

interface GoToActionBodyProps {
  action: PageGotoAction
  onChange: (action: PageGotoAction) => void
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
