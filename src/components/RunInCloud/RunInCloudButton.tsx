import { Button } from '@radix-ui/themes'
import { GrafanaIcon } from '../icons/GrafanaIcon'

interface RunInCloudButtonProps {
  onClick: () => void
}

export function RunInCloudButton({ onClick }: RunInCloudButtonProps) {
  return (
    <Button variant="outline" onClick={onClick}>
      <GrafanaIcon /> Run in Grafana Cloud
    </Button>
  )
}
