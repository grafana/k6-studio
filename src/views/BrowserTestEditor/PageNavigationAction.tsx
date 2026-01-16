import { PageGotoAction } from '@/main/runner/schema'

interface PageNavigationActionProps {
  action: PageGotoAction
}

export function PageNavigationAction({ action }: PageNavigationActionProps) {
  return (
    <div>
      Navigate to: <strong>{action.url}</strong>
    </div>
  )
}
