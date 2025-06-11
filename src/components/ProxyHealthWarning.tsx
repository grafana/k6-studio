import { Badge, Callout, Tooltip } from '@radix-ui/themes'
import { TriangleAlert } from 'lucide-react'

import { useStudioUIStore } from '@/store/ui'

import { ExternalLink } from './ExternalLink'
import { TextButton } from './TextButton'

export function ProxyHealthWarning() {
  const openSettingsDialog = useStudioUIStore(
    (state) => state.openSettingsDialog
  )

  return (
    <Callout.Root>
      <Callout.Icon>
        <TriangleAlert />
      </Callout.Icon>
      <Callout.Text>
        <strong>Proxy health check failed</strong>
        <br />
        Grafana k6 Studio cannot establish connection to the Internet. Unless
        this is expected due to your internal network configuration, check{' '}
        <TextButton onClick={() => openSettingsDialog('proxy')}>
          proxy settings
        </TextButton>{' '}
        or learn more in the{' '}
        <ExternalLink href="https://grafana.com/docs/k6-studio/troubleshoot/#502-bad-gateway-error">
          troubleshooting guide
        </ExternalLink>{' '}
        .
      </Callout.Text>
    </Callout.Root>
  )
}

export function ProxyHealthBadge() {
  return (
    <Tooltip content="Grafana k6 Studio cannot establish connection to the Internet. Unless this is expected due to your internal network configuration, check your proxy settings.">
      <Badge color="orange" ml="2">
        <TriangleAlert />
        Proxy health check failed
      </Badge>
    </Tooltip>
  )
}
