import { Button, ButtonProps } from '@radix-ui/themes'

import { GrafanaIcon } from '../icons/GrafanaIcon'

export function RunInCloudButton(props: ButtonProps) {
  return (
    <Button {...props}>
      <GrafanaIcon /> Run in Grafana Cloud
    </Button>
  )
}
